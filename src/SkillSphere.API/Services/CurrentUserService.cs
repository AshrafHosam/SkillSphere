using System.Security.Claims;
using SkillSphere.Domain.Enums;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public Guid? UserId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return id != null ? Guid.Parse(id) : null;
        }
    }

    public Guid? SchoolTenantId
    {
        get
        {
            var tid = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value;
            return !string.IsNullOrEmpty(tid) ? Guid.Parse(tid) : null;
        }
    }

    public UserRole? Role
    {
        get
        {
            var role = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
            return role != null && Enum.TryParse<UserRole>(role, out var r) ? r : null;
        }
    }

    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
