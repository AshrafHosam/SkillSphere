using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Auth;

namespace SkillSphere.Application.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<Result<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
    Task<Result> RevokeTokenAsync(Guid userId, CancellationToken ct = default);
}
