using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Attendance;

public class AttendanceRecordDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid ClassSectionId { get; set; }
    public string ClassSectionName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? SessionTime { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class SubmitAttendanceRequest
{
    public Guid SubjectId { get; set; }
    public Guid ClassSectionId { get; set; }
    public Guid SemesterId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? SessionTime { get; set; }
    public List<StudentAttendanceEntry> Entries { get; set; } = [];
}

public class StudentAttendanceEntry
{
    public Guid StudentProfileId { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class AttendanceComplianceDto
{
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int TotalExpectedSessions { get; set; }
    public int CompletedSessions { get; set; }
    public double CompletionPercentage { get; set; }
    public int LateDays { get; set; }
}
