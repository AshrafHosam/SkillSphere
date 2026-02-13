using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class BehaviorFeedback : TenantEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public string Category { get; set; } = string.Empty; // Behavior, Participation, etc.
    public string? Description { get; set; }
    public int? Rating { get; set; } // 1-5 scale
    public DateTime RecordedDate { get; set; }
}
