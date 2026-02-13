using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class NotificationEvent : TenantEntity
{
    public string EventType { get; set; } = string.Empty; // WeeklyReportDelivered, AttendanceMissing, EscalationUpdate
    public NotificationChannel Channel { get; set; }
    public Guid RecipientUserId { get; set; }
    public ApplicationUser RecipientUser { get; set; } = null!;

    public string? Subject { get; set; }
    public string? Body { get; set; }
    public string? TemplateId { get; set; }
    public string? TemplateData { get; set; } // JSON

    public NotificationDeliveryStatus DeliveryStatus { get; set; } = NotificationDeliveryStatus.Pending;
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? FailureReason { get; set; }

    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
}
