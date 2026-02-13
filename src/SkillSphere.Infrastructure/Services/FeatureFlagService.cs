using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class FeatureFlagService : IFeatureFlagService
{
    private readonly SkillSphereDbContext _db;
    public FeatureFlagService(SkillSphereDbContext db) => _db = db;

    public async Task<bool> IsFeatureEnabledAsync(Guid tenantId, FeatureType featureType, CancellationToken ct = default)
    {
        var flag = await _db.FeatureFlags.FirstOrDefaultAsync(f => f.SchoolTenantId == tenantId && f.FeatureType == featureType, ct);
        return flag?.IsEnabled ?? false;
    }
}
