namespace SkillSphere.Domain.Enums;

public enum UserRole
{
    PlatformSuperAdmin = 0,
    SchoolAdmin = 1,
    SchoolManager = 2,
    Teacher = 3,
    TeacherSupervisor = 4,
    Parent = 5,
    Student = 6
}

public enum AttendanceStatus
{
    Present = 0,
    Absent = 1,
    Late = 2,
    Excused = 3
}

public enum InternalReportCategory
{
    StudentRisk = 0,
    Behavior = 1,
    AcademicConcern = 2,
    OperationalIssue = 3
}

public enum InternalReportStatus
{
    Submitted = 0,
    UnderReview = 1,
    Escalated = 2,
    Resolved = 3,
    Closed = 4
}

public enum NotificationChannel
{
    WhatsApp = 0,
    Email = 1,
    InApp = 2
}

public enum NotificationDeliveryStatus
{
    Pending = 0,
    Sent = 1,
    Delivered = 2,
    Failed = 3
}

public enum FeatureType
{
    Attendance = 0,
    WeeklyReports = 1,
    PerformanceAttributes = 2,
    ParentAccess = 3,
    StudentAccess = 4,
    WhatsAppNotifications = 5,
    EmailNotifications = 6,
    InAppNotifications = 7,
    InternalReporting = 8,
    ParentTeacherMessaging = 9
}

public enum DayOfWeekFlag
{
    Sunday = 1,
    Monday = 2,
    Tuesday = 4,
    Wednesday = 8,
    Thursday = 16,
    Friday = 32,
    Saturday = 64
}

public enum AuditAction
{
    Login = 0,
    Logout = 1,
    Create = 2,
    Update = 3,
    Delete = 4,
    Deactivate = 5,
    Activate = 6,
    FeatureFlagChange = 7,
    ReportSubmission = 8,
    InternalReportAction = 9,
    NotificationSent = 10,
    RoleChange = 11,
    Escalation = 12,
    TimetablePublish = 13
}

public enum TimetableStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}

public enum WeeklyReportStatus
{
    Draft = 0,
    Submitted = 1,
    Reviewed = 2,
    Distributed = 3
}
