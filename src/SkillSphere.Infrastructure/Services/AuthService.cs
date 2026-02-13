using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Auth;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly SkillSphereDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(SkillSphereDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers
            .Include(u => u.SchoolTenant)
            .Include(u => u.TeacherProfile)
            .Include(u => u.StudentProfile)
            .Include(u => u.ParentProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Result<LoginResponse>.Failure("Invalid email or password.");

        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync(ct);

        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = MapToUserDto(user)
        });
    }

    public async Task<Result<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var (userId, _) = _jwt.ValidateAccessToken(request.AccessToken, validateLifetime: false);
        if (userId == null) return Result<LoginResponse>.Failure("Invalid token.");

        var user = await _db.ApplicationUsers
            .Include(u => u.SchoolTenant)
            .Include(u => u.TeacherProfile)
            .Include(u => u.StudentProfile)
            .Include(u => u.ParentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive, ct);

        if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiry < DateTime.UtcNow)
            return Result<LoginResponse>.Failure("Invalid refresh token.");

        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync(ct);

        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = MapToUserDto(user)
        });
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers.FindAsync([userId], ct);
        if (user == null) return Result.Failure("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return Result.Failure("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> RevokeTokenAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers.FindAsync([userId], ct);
        if (user == null) return Result.Failure("User not found.");

        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static UserDto MapToUserDto(ApplicationUser user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        FullName = $"{user.FirstName} {user.LastName}",
        Role = user.Role,
        SchoolTenantId = user.SchoolTenantId,
        SchoolName = user.SchoolTenant?.Name,
        AvatarUrl = user.AvatarUrl,
        IsSupervisor = user.TeacherProfile?.IsSupervisor ?? false,
        ProfileId = user.TeacherProfile?.Id ?? user.StudentProfile?.Id ?? user.ParentProfile?.Id
    };
}
