using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly SkillSphereDbContext _db;
    public AuditService(SkillSphereDbContext db) => _db = db;

    public async Task LogAsync(Guid? tenantId, Guid? userId, string? email, string? role, AuditAction action, string entityType, string? entityId, string? oldValues, string? newValues, string? description, string? ipAddress = null, string? userAgent = null, CancellationToken ct = default)
    {
        var log = new AuditLog
        {
            SchoolTenantId = tenantId,
            UserId = userId,
            UserEmail = email,
            UserRole = role,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            Description = description,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        await _db.AuditLogs.AddAsync(log, ct);
        await _db.SaveChangesAsync(ct);
    }
}
