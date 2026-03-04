using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class CurriculumContract : TenantEntity
{
    public Guid GradeId { get; set; }
    public Grade Grade { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public int PeriodsPerWeek { get; set; }
}
