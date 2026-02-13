using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Notifications;

public class NotificationEventDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public NotificationChannel Channel { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public NotificationDeliveryStatus DeliveryStatus { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? FailureReason { get; set; }
    public DateTime CreatedAt { get; set; }
}
