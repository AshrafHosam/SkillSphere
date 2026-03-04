using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class TimetableEntry : TenantEntity
{
    public Guid TimetableVersionId { get; set; }
    public TimetableVersion TimetableVersion { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }

    public Guid PeriodDefinitionId { get; set; }
    public PeriodDefinition PeriodDefinition { get; set; } = null!;
}
