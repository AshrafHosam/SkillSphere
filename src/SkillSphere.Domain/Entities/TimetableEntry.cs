using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class TimetableEntry : TenantEntity
{
    public Guid TimetableVersionId { get; set; }
    public TimetableVersion TimetableVersion { get; set; } = null!;

    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid ClassSectionId { get; set; }
    public ClassSection ClassSection { get; set; } = null!;

    public Guid GradeId { get; set; }
    public Grade Grade { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Room { get; set; }
}
