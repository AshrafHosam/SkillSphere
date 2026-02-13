using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class FeatureFlag : TenantEntity
{
    public FeatureType FeatureType { get; set; }
    public bool IsEnabled { get; set; }
    public string? Configuration { get; set; } // JSON for extra settings
}
