using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Timetable;

public class TimetableVersionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public int VersionNumber { get; set; }
    public TimetableStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int EntryCount { get; set; }
}

public class CreateTimetableVersionRequest
{
    public Guid GroupId { get; set; }
    public Guid SemesterId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class TimetableEntryDto
{
    public Guid Id { get; set; }
    public Guid TimetableVersionId { get; set; }
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public RoomType RoomType { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public Guid PeriodDefinitionId { get; set; }
    public int PeriodNumber { get; set; }
    public string PeriodLabel { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

public class AddTimetableEntryRequest
{
    public Guid TimetableVersionId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid TeacherProfileId { get; set; }
    public Guid RoomId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public Guid PeriodDefinitionId { get; set; }
}

public class TimetableValidationError
{
    public string Rule { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
