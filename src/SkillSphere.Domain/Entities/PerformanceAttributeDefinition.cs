using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class PerformanceAttributeDefinition : TenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "Academic Performance", "Behavior"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int OrderIndex { get; set; }
}
