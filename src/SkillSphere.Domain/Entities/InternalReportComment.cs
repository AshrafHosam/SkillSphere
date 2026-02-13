using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class InternalReportComment : BaseEntity
{
    public Guid InternalReportId { get; set; }
    public InternalReport InternalReport { get; set; } = null!;

    public Guid AuthorUserId { get; set; }
    public ApplicationUser AuthorUser { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public bool IsDecisionNote { get; set; }
}
