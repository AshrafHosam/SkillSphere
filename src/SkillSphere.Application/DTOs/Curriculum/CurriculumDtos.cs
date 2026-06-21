using System.ComponentModel.DataAnnotations;

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
    [Required]
    public Guid GradeId { get; set; }
    [Required]
    public Guid SemesterId { get; set; }
    [Required]
    public Guid SubjectId { get; set; }
    [Range(1, 50)]
    public int PeriodsPerWeek { get; set; }
}
