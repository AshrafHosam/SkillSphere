using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class Subject : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = [];
}
