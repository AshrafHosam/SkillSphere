using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class TeacherSubjectLink : TenantEntity
{
    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid? GradeId { get; set; }
    public Grade? Grade { get; set; }

    public bool IsActive { get; set; } = true;
}
