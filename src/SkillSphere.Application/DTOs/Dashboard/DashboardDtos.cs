namespace SkillSphere.Application.DTOs.Dashboard;

public class AdminDashboardDto
{
    public double AttendanceCompletionPercent { get; set; }
    public double WeeklyReportCompletionPercent { get; set; }
    public int LateSubmissions { get; set; }
    public int TotalTeachers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalParents { get; set; }
    public int OpenEscalations { get; set; }
    public int UnresolvedInternalReports { get; set; }
    public List<ComplianceHeatmapItem> ComplianceHeatmap { get; set; } = [];
    public NotificationStatusSummary NotificationStatus { get; set; } = new();
}

public class ManagerDashboardDto
{
    public int MissingAttendance { get; set; }
    public int MissingWeeklyReports { get; set; }
    public int TimetableConflicts { get; set; }
    public int StudentRiskQueue { get; set; }
    public List<TeacherComplianceItem> TeacherCompliance { get; set; } = [];
}

public class TeacherDashboardDto
{
    public List<TodaySessionDto> TodaySessions { get; set; } = [];
    public int AttendanceTasksDue { get; set; }
    public int WeeklyReportTasksDue { get; set; }
    public int TotalAssignedStudents { get; set; }
}

public class SupervisorDashboardDto
{
    public int InternalReportsInbox { get; set; }
    public int ComplianceAlerts { get; set; }
    public List<TrendingStudentDto> TrendingStudents { get; set; } = [];
}

public class ParentDashboardDto
{
    public List<StudentCardDto> StudentCards { get; set; } = [];
}

// Supporting DTOs
public class ComplianceHeatmapItem
{
    public string GradeName { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public double AttendanceRate { get; set; }
    public double ReportRate { get; set; }
}

public class NotificationStatusSummary
{
    public int TotalSent { get; set; }
    public int Delivered { get; set; }
    public int Failed { get; set; }
    public int Pending { get; set; }
}

public class TeacherComplianceItem
{
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public double AttendanceCompletion { get; set; }
    public double ReportCompletion { get; set; }
}

public class TodaySessionDto
{
    public Guid TimetableEntryId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public string GradeName { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? RoomName { get; set; }
    public bool AttendanceSubmitted { get; set; }
}

public class TrendingStudentDto
{
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int ReportCount { get; set; }
    public string LatestCategory { get; set; } = string.Empty;
}

public class StudentCardDto
{
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string GradeName { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty;
    public int TotalWeeklyReports { get; set; }
    public double? AverageGrade { get; set; }
}
