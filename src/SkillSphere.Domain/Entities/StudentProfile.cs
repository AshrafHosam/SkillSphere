using SkillSphere.Domain.Common;

namespace SkillSphere.Domain.Entities;

public class StudentProfile : TenantEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public string? StudentNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }

    // Navigation
    public ICollection<StudentAssignment> Assignments { get; set; } = [];
    public ICollection<ParentLink> ParentLinks { get; set; } = [];
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = [];
    public ICollection<GradeRecord> GradeRecords { get; set; } = [];
    public ICollection<WeeklyReport> WeeklyReports { get; set; } = [];
    public ICollection<BehaviorFeedback> BehaviorFeedbacks { get; set; } = [];
}
