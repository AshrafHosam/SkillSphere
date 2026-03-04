using SkillSphere.Domain.Common;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Domain.Entities;

public class SchoolTenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
    public string? Timezone { get; set; } = "UTC";
    public DayOfWeekFlag WorkingDays { get; set; } = (DayOfWeekFlag)31; // Sun+Mon+Tue+Wed+Thu
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<FeatureFlag> FeatureFlags { get; set; } = [];
    public ICollection<ApplicationUser> Users { get; set; } = [];
    public ICollection<Grade> Grades { get; set; } = [];
    public ICollection<Group> Groups { get; set; } = [];
    public ICollection<Subject> Subjects { get; set; } = [];
    public ICollection<Department> Departments { get; set; } = [];
    public ICollection<Semester> Semesters { get; set; } = [];
    public ICollection<Room> Rooms { get; set; } = [];
    public ICollection<PeriodDefinition> PeriodDefinitions { get; set; } = [];
}
