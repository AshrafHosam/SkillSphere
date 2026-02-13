using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class GradeRecord : TenantEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public decimal? Score { get; set; }
    public string? LetterGrade { get; set; }
    public decimal? MaxScore { get; set; }
    public string? AssessmentType { get; set; } // Quiz, Exam, Assignment, etc.
    public string? Notes { get; set; }
    public DateTime RecordedDate { get; set; }
}
