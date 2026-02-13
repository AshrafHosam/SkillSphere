using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class InternalReport : TenantEntity
{
    public Guid ReporterTeacherProfileId { get; set; }
    public TeacherProfile ReporterTeacher { get; set; } = null!;

    public Guid? StudentProfileId { get; set; }
    public StudentProfile? StudentProfile { get; set; }

    public Guid? AssignedSupervisorId { get; set; }
    public TeacherProfile? AssignedSupervisor { get; set; }

    public InternalReportCategory Category { get; set; }
    public InternalReportStatus Status { get; set; } = InternalReportStatus.Submitted;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AttachmentUrls { get; set; } // JSON array

    public Guid? EscalatedToUserId { get; set; }
    public ApplicationUser? EscalatedToUser { get; set; }
    public DateTime? EscalatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // Navigation
    public ICollection<InternalReportComment> Comments { get; set; } = [];
}
