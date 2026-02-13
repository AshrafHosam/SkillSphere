using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class WeeklyReportItem : BaseEntity
{
    public Guid WeeklyReportId { get; set; }
    public WeeklyReport WeeklyReport { get; set; } = null!;

    public string AttributeName { get; set; } = string.Empty; // Grade, Notes, Behavior, Participation, etc.
    public string? Value { get; set; }
    public int? NumericValue { get; set; }
    public string? Comments { get; set; }
}
