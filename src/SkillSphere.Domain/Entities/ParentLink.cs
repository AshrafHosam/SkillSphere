using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class ParentLink : TenantEntity
{
    public Guid ParentProfileId { get; set; }
    public ParentProfile ParentProfile { get; set; } = null!;

    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public bool IsPrimary { get; set; } = true;
}
