using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class AttendanceRecord : TenantEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public DateTime Date { get; set; }
    public TimeSpan? SessionTime { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
}
