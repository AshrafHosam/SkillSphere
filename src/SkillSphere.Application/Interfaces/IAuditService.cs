using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(Guid? tenantId, Guid? userId, string? email, string? role, AuditAction action, string entityType, string? entityId, string? oldValues, string? newValues, string? description, string? ipAddress = null, string? userAgent = null, CancellationToken ct = default);
}
