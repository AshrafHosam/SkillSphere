using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class PeriodDefinition : TenantEntity
{
    public int PeriodNumber { get; set; }
    public string Label { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsBreak { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = [];
}
