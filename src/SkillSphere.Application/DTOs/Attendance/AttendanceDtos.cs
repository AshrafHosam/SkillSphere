using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Attendance;

public class AttendanceRecordDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public Guid? TimetableEntryId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? SessionTime { get; set; }
    public string? PeriodLabel { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public AttendanceStatus Status { get; set; }
    public SubmissionStatus SubmissionStatus { get; set; }
    public string? Notes { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? LastEditedAt { get; set; }
    public string? LastEditedBy { get; set; }
    public string? EditReason { get; set; }
}

public class SubmitAttendanceRequest
{
    public Guid SubjectId { get; set; }
    public Guid GroupId { get; set; }
    public Guid SemesterId { get; set; }
    public Guid? TimetableEntryId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? SessionTime { get; set; }
    public bool IsDraft { get; set; }
    public List<StudentAttendanceEntry> Entries { get; set; } = [];
}

public class StudentAttendanceEntry
{
    public Guid StudentProfileId { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAttendanceEntryRequest
{
    public Guid AttendanceRecordId { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
    public string EditReason { get; set; } = string.Empty;
}

public class GrantEditPermissionRequest
{
    public Guid TeacherProfileId { get; set; }
    public Guid? TimetableEntryId { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class AttendanceEditPermissionDto
{
    public Guid Id { get; set; }
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public Guid? TimetableEntryId { get; set; }
    public string? SessionLabel { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public Guid GrantedByUserId { get; set; }
    public string GrantedByName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
}

public class SessionComplianceDto
{
    public Guid TimetableEntryId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string PeriodLabel { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string SubmissionStatus { get; set; } = string.Empty; // "Submitted", "SubmittedLate", "Missing"
    public DateTime? SubmittedAt { get; set; }
}

public class AttendanceComplianceDto
{
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int TotalExpectedSessions { get; set; }
    public int CompletedSessions { get; set; }
    public double CompletionPercentage { get; set; }
    public int LateDays { get; set; }
    public int MissingSessions { get; set; }
}
