namespace SkillSphere.Application.DTOs.Curriculum;

public class CurriculumContractDto
{
    public Guid Id { get; set; }
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public int PeriodsPerWeek { get; set; }
}

public class SetCurriculumContractRequest
{
    public Guid GradeId { get; set; }
    public Guid SemesterId { get; set; }
    public Guid SubjectId { get; set; }
    public int PeriodsPerWeek { get; set; }
}
