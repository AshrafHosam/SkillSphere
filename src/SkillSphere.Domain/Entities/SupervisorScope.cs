using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class SupervisorScope : TenantEntity
{
    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    // Scope dimensions (any combination)
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? GradeId { get; set; }
    public Grade? Grade { get; set; }

    public Guid? SubjectId { get; set; }
    public Subject? Subject { get; set; }

    public Guid? ClassSectionId { get; set; }
    public ClassSection? ClassSection { get; set; }

    public Guid? SemesterId { get; set; }
    public Semester? Semester { get; set; }

    public bool IsActive { get; set; } = true;
}
