using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class Semester : TenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "2025-2026 Term 1"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<StudentAssignment> StudentAssignments { get; set; } = [];
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
    public ICollection<TimetableVersion> TimetableVersions { get; set; } = [];
    public ICollection<WeeklyReport> WeeklyReports { get; set; } = [];
}
