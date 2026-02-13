using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Timetable;

public class TimetableVersionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public int VersionNumber { get; set; }
    public TimetableStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int EntryCount { get; set; }
}

public class CreateTimetableVersionRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
}

public class TimetableEntryDto
{
    public Guid Id { get; set; }
    public Guid TimetableVersionId { get; set; }
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid ClassSectionId { get; set; }
    public string ClassSectionName { get; set; } = string.Empty;
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Room { get; set; }
}

public class CreateTimetableEntryRequest
{
    public Guid TimetableVersionId { get; set; }
    public Guid TeacherProfileId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid ClassSectionId { get; set; }
    public Guid GradeId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Room { get; set; }
}

public class TimetableConflict
{
    public string ConflictType { get; set; } = string.Empty; // TeacherOverlap, ClassOverlap
    public string Description { get; set; } = string.Empty;
    public TimetableEntryDto ExistingEntry { get; set; } = null!;
}
