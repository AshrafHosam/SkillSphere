using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class ClassSection : TenantEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "4A", "Section B"
    public Guid GradeId { get; set; }
    public Grade Grade { get; set; } = null!;
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<StudentAssignment> StudentAssignments { get; set; } = [];
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = [];
}
