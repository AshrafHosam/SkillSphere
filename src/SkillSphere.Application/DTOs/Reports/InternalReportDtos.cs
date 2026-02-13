using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Reports;

public class InternalReportDto
{
    public Guid Id { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string? StudentName { get; set; }
    public Guid? StudentProfileId { get; set; }
    public string? AssignedSupervisorName { get; set; }
    public InternalReportCategory Category { get; set; }
    public InternalReportStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AttachmentUrls { get; set; }
    public string? EscalatedToName { get; set; }
    public DateTime? EscalatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<InternalReportCommentDto> Comments { get; set; } = [];
}

public class InternalReportCommentDto
{
    public Guid Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsDecisionNote { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateInternalReportRequest
{
    public Guid? StudentProfileId { get; set; }
    public InternalReportCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AttachmentUrls { get; set; }
}

public class AddInternalReportCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public bool IsDecisionNote { get; set; }
}

public class EscalateInternalReportRequest
{
    public Guid EscalateToUserId { get; set; }
    public string? Notes { get; set; }
}
