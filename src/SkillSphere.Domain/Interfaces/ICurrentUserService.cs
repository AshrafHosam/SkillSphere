using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? SchoolTenantId { get; }
    UserRole? Role { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}
