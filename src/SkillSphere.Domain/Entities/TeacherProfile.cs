using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class TeacherProfile : TenantEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public string? EmployeeId { get; set; }
    public string? Specialization { get; set; }
    public bool IsSupervisor { get; set; }
    public int MaxPeriodsPerDay { get; set; } = 6;
    public int MaxPeriodsPerWeek { get; set; } = 25;

    // Navigation
    public ICollection<TeacherSubjectLink> TeacherSubjectLinks { get; set; } = [];
    public ICollection<SupervisorScope> SupervisorScopes { get; set; } = [];
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = [];
}
