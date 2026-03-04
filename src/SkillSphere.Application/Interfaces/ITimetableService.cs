using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Timetable;

namespace SkillSphere.Application.Interfaces;

public interface ITimetableService
{
    // Versions
    Task<Result<List<TimetableVersionDto>>> GetVersionsAsync(Guid tenantId, Guid? groupId = null, Guid? semesterId = null, CancellationToken ct = default);
    Task<Result<TimetableVersionDto>> CreateVersionAsync(Guid tenantId, CreateTimetableVersionRequest request, CancellationToken ct = default);

    // Entries
    Task<Result<List<TimetableEntryDto>>> GetEntriesAsync(Guid versionId, CancellationToken ct = default);
    Task<Result<TimetableEntryDto>> AddEntryAsync(Guid tenantId, AddTimetableEntryRequest request, CancellationToken ct = default);
    Task<Result> RemoveEntryAsync(Guid entryId, CancellationToken ct = default);

    // Validation & Publication
    Task<Result<List<TimetableValidationError>>> ValidateForPublicationAsync(Guid versionId, CancellationToken ct = default);
    Task<Result> PublishAsync(Guid versionId, string publishedBy, CancellationToken ct = default);
    Task<Result> ArchiveAsync(Guid versionId, CancellationToken ct = default);

    // Query
    Task<Result<List<TimetableEntryDto>>> GetTeacherScheduleAsync(Guid teacherProfileId, Guid semesterId, CancellationToken ct = default);
    Task<Result<List<TimetableEntryDto>>> GetGroupScheduleAsync(Guid groupId, Guid semesterId, CancellationToken ct = default);
}
