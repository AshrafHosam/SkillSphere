using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Reports;

public class WeeklyReportDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public DateTime WeekStartDate { get; set; }
    public DateTime WeekEndDate { get; set; }
    public WeeklyReportStatus Status { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public List<WeeklyReportItemDto> Items { get; set; } = [];
}

public class WeeklyReportItemDto
{
    public Guid Id { get; set; }
    public string AttributeName { get; set; } = string.Empty;
    public string? Value { get; set; }
    public int? NumericValue { get; set; }
    public string? Comments { get; set; }
}

public class CreateWeeklyReportRequest
{
    public Guid StudentProfileId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid SemesterId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime WeekStartDate { get; set; }
    public DateTime WeekEndDate { get; set; }
    public List<WeeklyReportItemRequest> Items { get; set; } = [];
}

public class WeeklyReportItemRequest
{
    public string AttributeName { get; set; } = string.Empty;
    public string? Value { get; set; }
    public int? NumericValue { get; set; }
    public string? Comments { get; set; }
}

public class WeeklyReportComplianceDto
{
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int TotalExpected { get; set; }
    public int Submitted { get; set; }
    public int Late { get; set; }
    public double CompletionPercentage { get; set; }
}
