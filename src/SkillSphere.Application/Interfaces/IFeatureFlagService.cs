using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.Interfaces;

public interface IFeatureFlagService
{
    Task<bool> IsFeatureEnabledAsync(Guid tenantId, FeatureType featureType, CancellationToken ct = default);
}
