using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Timetable;

namespace SkillSphere.Application.Interfaces;

public interface ITimetableService
{
    Task<Result<List<TimetableVersionDto>>> GetVersionsAsync(Guid tenantId, Guid? semesterId = null, CancellationToken ct = default);
    Task<Result<TimetableVersionDto>> CreateVersionAsync(Guid tenantId, CreateTimetableVersionRequest request, CancellationToken ct = default);
    Task<Result> PublishVersionAsync(Guid versionId, CancellationToken ct = default);

    Task<Result<List<TimetableEntryDto>>> GetEntriesAsync(Guid versionId, CancellationToken ct = default);
    Task<Result<List<TimetableEntryDto>>> GetTeacherTimetableAsync(Guid teacherProfileId, Guid semesterId, CancellationToken ct = default);
    Task<Result<TimetableEntryDto>> CreateEntryAsync(Guid tenantId, CreateTimetableEntryRequest request, CancellationToken ct = default);
    Task<Result<List<TimetableConflict>>> ValidateEntryAsync(Guid tenantId, CreateTimetableEntryRequest request, CancellationToken ct = default);
    Task<Result> DeleteEntryAsync(Guid entryId, CancellationToken ct = default);
}
