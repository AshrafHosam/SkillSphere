using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class TeacherAssignment : TenantEntity
{
    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid ClassSectionId { get; set; }
    public ClassSection ClassSection { get; set; } = null!;

    public Guid GradeId { get; set; }
    public Grade Grade { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public bool IsActive { get; set; } = true;
}
