using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Users;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly SkillSphereDbContext _db;

    public UserService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<UserListDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers.FirstOrDefaultAsync(u => u.Id == id, ct);
        return user == null
            ? Result<UserListDto>.Failure("User not found.")
            : Result<UserListDto>.Success(MapToListDto(user));
    }

    public async Task<Result<PagedResult<UserListDto>>> GetUsersAsync(Guid tenantId, UserRole? role, PaginationParams p, CancellationToken ct = default)
    {
        var query = _db.ApplicationUsers.Where(u => u.SchoolTenantId == tenantId);
        if (role.HasValue) query = query.Where(u => u.Role == role.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
            .Skip((p.Page - 1) * p.PageSize).Take(p.PageSize)
            .ToListAsync(ct);

        return Result<PagedResult<UserListDto>>.Success(new PagedResult<UserListDto>
        {
            Items = items.Select(MapToListDto).ToList(),
            TotalCount = total,
            Page = p.Page,
            PageSize = p.PageSize
        });
    }

    public async Task<Result<UserListDto>> CreateUserAsync(Guid tenantId, CreateUserRequest request, CancellationToken ct = default)
    {
        if (await _db.ApplicationUsers.AnyAsync(u => u.Email == request.Email, ct))
            return Result<UserListDto>.Failure("Email already exists.");

        var user = new ApplicationUser
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Role = request.Role,
            SchoolTenantId = tenantId
        };

        await _db.ApplicationUsers.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);
        return Result<UserListDto>.Success(MapToListDto(user));
    }

    public async Task<Result<UserListDto>> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers.FindAsync([id], ct);
        if (user == null) return Result<UserListDto>.Failure("User not found.");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;
        user.AvatarUrl = request.AvatarUrl;
        await _db.SaveChangesAsync(ct);
        return Result<UserListDto>.Success(MapToListDto(user));
    }

    public async Task<Result> DeactivateUserAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers.FindAsync([id], ct);
        if (user == null) return Result.Failure("User not found.");
        user.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> ActivateUserAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _db.ApplicationUsers.FindAsync([id], ct);
        if (user == null) return Result.Failure("User not found.");
        user.IsActive = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<TeacherDto>> CreateTeacherAsync(Guid tenantId, CreateTeacherRequest request, CancellationToken ct = default)
    {
        if (await _db.ApplicationUsers.AnyAsync(u => u.Email == request.Email, ct))
            return Result<TeacherDto>.Failure("Email already exists.");

        var user = new ApplicationUser
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Role = UserRole.Teacher,
            SchoolTenantId = tenantId
        };

        var profile = new TeacherProfile
        {
            UserId = user.Id,
            SchoolTenantId = tenantId,
            EmployeeId = request.EmployeeId,
            Specialization = request.Specialization
        };

        await _db.ApplicationUsers.AddAsync(user, ct);
        await _db.TeacherProfiles.AddAsync(profile, ct);
        await _db.SaveChangesAsync(ct);

        return Result<TeacherDto>.Success(new TeacherDto
        {
            ProfileId = profile.Id,
            UserId = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Email = user.Email,
            EmployeeId = profile.EmployeeId,
            Specialization = profile.Specialization,
            IsActive = true
        });
    }

    public async Task<Result<StudentDto>> CreateStudentAsync(Guid tenantId, CreateStudentRequest request, CancellationToken ct = default)
    {
        if (await _db.ApplicationUsers.AnyAsync(u => u.Email == request.Email, ct))
            return Result<StudentDto>.Failure("Email already exists.");

        var user = new ApplicationUser
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Role = UserRole.Student,
            SchoolTenantId = tenantId
        };

        var profile = new StudentProfile
        {
            UserId = user.Id,
            SchoolTenantId = tenantId,
            StudentNumber = request.StudentNumber,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender
        };

        await _db.ApplicationUsers.AddAsync(user, ct);
        await _db.StudentProfiles.AddAsync(profile, ct);
        await _db.SaveChangesAsync(ct);

        return Result<StudentDto>.Success(new StudentDto
        {
            ProfileId = profile.Id,
            UserId = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Email = user.Email,
            StudentNumber = profile.StudentNumber,
            DateOfBirth = profile.DateOfBirth,
            Gender = profile.Gender,
            IsActive = true
        });
    }

    public async Task<Result<PagedResult<TeacherDto>>> GetTeachersAsync(Guid tenantId, PaginationParams p, CancellationToken ct = default)
    {
        var query = _db.TeacherProfiles
            .Include(t => t.User)
            .Where(t => t.SchoolTenantId == tenantId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(t => t.User.LastName)
            .Skip((p.Page - 1) * p.PageSize).Take(p.PageSize)
            .Select(t => new TeacherDto
            {
                ProfileId = t.Id,
                UserId = t.UserId,
                FullName = t.User.FirstName + " " + t.User.LastName,
                Email = t.User.Email,
                EmployeeId = t.EmployeeId,
                Specialization = t.Specialization,
                IsSupervisor = t.IsSupervisor,
                IsActive = t.User.IsActive
            }).ToListAsync(ct);

        return Result<PagedResult<TeacherDto>>.Success(new PagedResult<TeacherDto>
        {
            Items = items, TotalCount = total, Page = p.Page, PageSize = p.PageSize
        });
    }

    public async Task<Result<PagedResult<StudentDto>>> GetStudentsAsync(Guid tenantId, PaginationParams p, CancellationToken ct = default)
    {
        var query = _db.StudentProfiles
            .Include(s => s.User)
            .Where(s => s.SchoolTenantId == tenantId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(s => s.User.LastName)
            .Skip((p.Page - 1) * p.PageSize).Take(p.PageSize)
            .Select(s => new StudentDto
            {
                ProfileId = s.Id,
                UserId = s.UserId,
                FullName = s.User.FirstName + " " + s.User.LastName,
                Email = s.User.Email,
                StudentNumber = s.StudentNumber,
                DateOfBirth = s.DateOfBirth,
                Gender = s.Gender,
                IsActive = s.User.IsActive
            }).ToListAsync(ct);

        return Result<PagedResult<StudentDto>>.Success(new PagedResult<StudentDto>
        {
            Items = items, TotalCount = total, Page = p.Page, PageSize = p.PageSize
        });
    }

    public async Task<Result<PagedResult<ParentDto>>> GetParentsAsync(Guid tenantId, PaginationParams p, CancellationToken ct = default)
    {
        var query = _db.ParentProfiles
            .Include(pp => pp.User)
            .Include(pp => pp.ParentLinks).ThenInclude(pl => pl.StudentProfile).ThenInclude(sp => sp.User)
            .Where(pp => pp.SchoolTenantId == tenantId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(pp => pp.User.LastName)
            .Skip((p.Page - 1) * p.PageSize).Take(p.PageSize)
            .ToListAsync(ct);

        return Result<PagedResult<ParentDto>>.Success(new PagedResult<ParentDto>
        {
            Items = items.Select(pp => new ParentDto
            {
                ProfileId = pp.Id,
                UserId = pp.UserId,
                FullName = $"{pp.User.FirstName} {pp.User.LastName}",
                Email = pp.User.Email,
                Relationship = pp.Relationship,
                Students = pp.ParentLinks.Select(pl => new StudentDto
                {
                    ProfileId = pl.StudentProfile.Id,
                    UserId = pl.StudentProfile.UserId,
                    FullName = $"{pl.StudentProfile.User.FirstName} {pl.StudentProfile.User.LastName}",
                    Email = pl.StudentProfile.User.Email,
                    StudentNumber = pl.StudentProfile.StudentNumber
                }).ToList()
            }).ToList(),
            TotalCount = total, Page = p.Page, PageSize = p.PageSize
        });
    }

    public async Task<Result> LinkParentToStudentAsync(Guid tenantId, LinkParentRequest request, CancellationToken ct = default)
    {
        var parentProfile = await _db.ParentProfiles.FirstOrDefaultAsync(p => p.UserId == request.ParentUserId && p.SchoolTenantId == tenantId, ct);
        if (parentProfile == null)
        {
            var parentUser = await _db.ApplicationUsers.FirstOrDefaultAsync(u => u.Id == request.ParentUserId && u.Role == UserRole.Parent && u.SchoolTenantId == tenantId, ct);
            if (parentUser == null) return Result.Failure("Parent user not found.");

            parentProfile = new ParentProfile { UserId = parentUser.Id, SchoolTenantId = tenantId };
            await _db.ParentProfiles.AddAsync(parentProfile, ct);
        }

        var studentProfile = await _db.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == request.StudentUserId && s.SchoolTenantId == tenantId, ct);
        if (studentProfile == null) return Result.Failure("Student not found.");

        if (await _db.ParentLinks.AnyAsync(pl => pl.ParentProfileId == parentProfile.Id && pl.StudentProfileId == studentProfile.Id, ct))
            return Result.Failure("Link already exists.");

        await _db.ParentLinks.AddAsync(new ParentLink
        {
            ParentProfileId = parentProfile.Id,
            StudentProfileId = studentProfile.Id,
            SchoolTenantId = tenantId,
            IsPrimary = request.IsPrimary
        }, ct);

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static UserListDto MapToListDto(ApplicationUser u) => new()
    {
        Id = u.Id,
        Email = u.Email,
        FullName = $"{u.FirstName} {u.LastName}",
        Role = u.Role,
        IsActive = u.IsActive,
        CreatedAt = u.CreatedAt
    };
}
