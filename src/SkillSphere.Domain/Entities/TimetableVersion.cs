using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class TimetableVersion : TenantEntity
{
    public string Name { get; set; } = string.Empty;

    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public Guid SemesterId { get; set; }
    public Semester Semester { get; set; } = null!;

    public int VersionNumber { get; set; } = 1;
    public TimetableStatus Status { get; set; } = TimetableStatus.Draft;
    public DateTime? PublishedAt { get; set; }
    public string? PublishedBy { get; set; }

    // Navigation
    public ICollection<TimetableEntry> Entries { get; set; } = [];
}
