using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class ParentProfile : TenantEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public string? Relationship { get; set; } // Father, Mother, Guardian

    // Navigation
    public ICollection<ParentLink> ParentLinks { get; set; } = [];
}
