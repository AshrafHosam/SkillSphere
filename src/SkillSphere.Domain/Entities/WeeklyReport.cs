using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class WeeklyReport : TenantEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public int WeekNumber { get; set; }
    public DateTime WeekStartDate { get; set; }
    public DateTime WeekEndDate { get; set; }

    public WeeklyReportStatus Status { get; set; } = WeeklyReportStatus.Draft;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? DistributedAt { get; set; }

    // Navigation
    public ICollection<WeeklyReportItem> Items { get; set; } = [];
}
