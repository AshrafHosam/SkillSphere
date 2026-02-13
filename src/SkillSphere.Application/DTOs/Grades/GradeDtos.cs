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

public class CreateGradeRecordRequest
{
    public Guid StudentProfileId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid SemesterId { get; set; }
    public decimal? Score { get; set; }
    public string? LetterGrade { get; set; }
    public decimal? MaxScore { get; set; }
    public string? AssessmentType { get; set; }
    public string? Notes { get; set; }
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
    public Guid StudentProfileId { get; set; }
    public Guid SemesterId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? Rating { get; set; }
}
