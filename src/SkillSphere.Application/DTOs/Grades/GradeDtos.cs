using System.ComponentModel.DataAnnotations;

namespace SkillSphere.Application.DTOs.Grades;

public class GradeRecordDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public decimal? Score { get; set; }
    public string? LetterGrade { get; set; }
    public decimal? MaxScore { get; set; }
    public string? AssessmentType { get; set; }
    public string? Notes { get; set; }
    public DateTime RecordedDate { get; set; }
}

public class CreateGradeRecordRequest : IValidatableObject
{
    [Required]
    public Guid StudentProfileId { get; set; }
    [Required]
    public Guid SubjectId { get; set; }
    [Required]
    public Guid SemesterId { get; set; }
    [Range(0, 1000)]
    public decimal? Score { get; set; }
    [MaxLength(10)]
    public string? LetterGrade { get; set; }
    [Range(1, 1000)]
    public decimal? MaxScore { get; set; }
    [MaxLength(50)]
    public string? AssessmentType { get; set; }
    [MaxLength(500)]
    public string? Notes { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Score.HasValue && MaxScore.HasValue && Score > MaxScore)
            yield return new ValidationResult("Score cannot exceed MaxScore.", [nameof(Score)]);
    }
}

public class BehaviorFeedbackDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? Rating { get; set; }
    public DateTime RecordedDate { get; set; }
}

public class CreateBehaviorFeedbackRequest
{
    [Required]
    public Guid StudentProfileId { get; set; }
    [Required]
    public Guid SemesterId { get; set; }
    [Required, MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? Description { get; set; }
    [Range(1, 5)]
    public int? Rating { get; set; }
}
