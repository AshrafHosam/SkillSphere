using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class AttendanceEditPermission : TenantEntity
{
    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = null!;

    public Guid? TimetableEntryId { get; set; }
    public TimetableEntry? TimetableEntry { get; set; }

    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }

    public Guid GrantedByUserId { get; set; }
    public string GrantedByName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;

    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
}
