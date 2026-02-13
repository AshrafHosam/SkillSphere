using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class Grade : TenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "Grade 1", "1/1"
    public int OrderIndex { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<ClassSection> ClassSections { get; set; } = [];
    public ICollection<StudentAssignment> StudentAssignments { get; set; } = [];
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
}
