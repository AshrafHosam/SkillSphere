using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Timetable;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class TimetableService : ITimetableService
{
    private readonly SkillSphereDbContext _db;
    public TimetableService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<List<TimetableVersionDto>>> GetVersionsAsync(Guid tenantId, Guid? semesterId, CancellationToken ct)
    {
        var q = _db.TimetableVersions.Include(v => v.Semester).Include(v => v.Entries).Where(v => v.SchoolTenantId == tenantId);
        if (semesterId.HasValue) q = q.Where(v => v.SemesterId == semesterId.Value);

        var items = await q.OrderByDescending(v => v.CreatedAt).Select(v => new TimetableVersionDto
        {
            Id = v.Id, Name = v.Name, SemesterId = v.SemesterId, SemesterName = v.Semester.Name,
            VersionNumber = v.VersionNumber, Status = v.Status, PublishedAt = v.PublishedAt,
            EntryCount = v.Entries.Count
        }).ToListAsync(ct);

        return Result<List<TimetableVersionDto>>.Success(items);
    }

    public async Task<Result<TimetableVersionDto>> CreateVersionAsync(Guid tenantId, CreateTimetableVersionRequest req, CancellationToken ct)
    {
        var maxVersion = await _db.TimetableVersions.Where(v => v.SchoolTenantId == tenantId && v.SemesterId == req.SemesterId).MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        var version = new TimetableVersion
        {
            Name = req.Name, SemesterId = req.SemesterId, VersionNumber = maxVersion + 1,
            Status = TimetableStatus.Draft, SchoolTenantId = tenantId
        };
        await _db.TimetableVersions.AddAsync(version, ct);
        await _db.SaveChangesAsync(ct);

        return Result<TimetableVersionDto>.Success(new TimetableVersionDto
        {
            Id = version.Id, Name = version.Name, SemesterId = version.SemesterId,
            VersionNumber = version.VersionNumber, Status = version.Status
        });
    }

    public async Task<Result> PublishVersionAsync(Guid versionId, CancellationToken ct)
    {
        var version = await _db.TimetableVersions.FindAsync([versionId], ct);
        if (version == null) return Result.Failure("Version not found.");

        // Archive previously published versions for this semester
        var previous = await _db.TimetableVersions.Where(v => v.SemesterId == version.SemesterId && v.Status == TimetableStatus.Published && v.Id != versionId).ToListAsync(ct);
        previous.ForEach(v => v.Status = TimetableStatus.Archived);

        version.Status = TimetableStatus.Published;
        version.PublishedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<List<TimetableEntryDto>>> GetEntriesAsync(Guid versionId, CancellationToken ct)
    {
        var data = await _db.TimetableEntries
            .Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Subject).Include(e => e.ClassSection).Include(e => e.Grade)
            .Where(e => e.TimetableVersionId == versionId)
            .OrderBy(e => e.DayOfWeek).ThenBy(e => e.StartTime)
            .ToListAsync(ct);
        var items = data.Select(MapEntryDto).ToList();
        return Result<List<TimetableEntryDto>>.Success(items);
    }

    public async Task<Result<List<TimetableEntryDto>>> GetTeacherTimetableAsync(Guid teacherProfileId, Guid semesterId, CancellationToken ct)
    {
        var publishedVersion = await _db.TimetableVersions
            .FirstOrDefaultAsync(v => v.SemesterId == semesterId && v.Status == TimetableStatus.Published, ct);

        if (publishedVersion == null) return Result<List<TimetableEntryDto>>.Success([]);

        var data = await _db.TimetableEntries
            .Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Subject).Include(e => e.ClassSection).Include(e => e.Grade)
            .Where(e => e.TimetableVersionId == publishedVersion.Id && e.TeacherProfileId == teacherProfileId)
            .OrderBy(e => e.DayOfWeek).ThenBy(e => e.StartTime)
            .ToListAsync(ct);
        var items = data.Select(MapEntryDto).ToList();
        return Result<List<TimetableEntryDto>>.Success(items);
    }

    public async Task<Result<TimetableEntryDto>> CreateEntryAsync(Guid tenantId, CreateTimetableEntryRequest req, CancellationToken ct)
    {
        // Validate conflicts first
        var conflicts = await ValidateEntryInternalAsync(tenantId, req, ct);
        if (conflicts.Count > 0)
            return Result<TimetableEntryDto>.Failure($"Timetable conflicts detected: {string.Join("; ", conflicts.Select(c => c.Description))}");

        var entry = new TimetableEntry
        {
            TimetableVersionId = req.TimetableVersionId, TeacherProfileId = req.TeacherProfileId,
            SubjectId = req.SubjectId, ClassSectionId = req.ClassSectionId, GradeId = req.GradeId,
            DayOfWeek = req.DayOfWeek, StartTime = req.StartTime, EndTime = req.EndTime,
            Room = req.Room, SchoolTenantId = tenantId
        };
        await _db.TimetableEntries.AddAsync(entry, ct);
        await _db.SaveChangesAsync(ct);

        return Result<TimetableEntryDto>.Success(new TimetableEntryDto
        {
            Id = entry.Id, TimetableVersionId = entry.TimetableVersionId,
            TeacherProfileId = entry.TeacherProfileId, SubjectId = entry.SubjectId,
            ClassSectionId = entry.ClassSectionId, GradeId = entry.GradeId,
            DayOfWeek = entry.DayOfWeek, StartTime = entry.StartTime, EndTime = entry.EndTime, Room = entry.Room
        });
    }

    public async Task<Result<List<TimetableConflict>>> ValidateEntryAsync(Guid tenantId, CreateTimetableEntryRequest req, CancellationToken ct)
    {
        var conflicts = await ValidateEntryInternalAsync(tenantId, req, ct);
        return Result<List<TimetableConflict>>.Success(conflicts);
    }

    public async Task<Result> DeleteEntryAsync(Guid entryId, CancellationToken ct)
    {
        var entry = await _db.TimetableEntries.FindAsync([entryId], ct);
        if (entry == null) return Result.Failure("Entry not found.");
        entry.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    private async Task<List<TimetableConflict>> ValidateEntryInternalAsync(Guid tenantId, CreateTimetableEntryRequest req, CancellationToken ct)
    {
        var conflicts = new List<TimetableConflict>();
        var existingEntries = await _db.TimetableEntries
            .Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Subject).Include(e => e.ClassSection).Include(e => e.Grade)
            .Where(e => e.TimetableVersionId == req.TimetableVersionId && e.DayOfWeek == req.DayOfWeek)
            .ToListAsync(ct);

        foreach (var existing in existingEntries)
        {
            bool overlaps = req.StartTime < existing.EndTime && req.EndTime > existing.StartTime;
            if (!overlaps) continue;

            if (existing.TeacherProfileId == req.TeacherProfileId)
            {
                conflicts.Add(new TimetableConflict
                {
                    ConflictType = "TeacherOverlap",
                    Description = $"Teacher already has a session at {existing.StartTime}-{existing.EndTime} for {existing.Subject.Name}",
                    ExistingEntry = MapEntryDto(existing)
                });
            }

            if (existing.ClassSectionId == req.ClassSectionId)
            {
                conflicts.Add(new TimetableConflict
                {
                    ConflictType = "ClassOverlap",
                    Description = $"Class already has a session at {existing.StartTime}-{existing.EndTime} with {existing.TeacherProfile.User.FirstName}",
                    ExistingEntry = MapEntryDto(existing)
                });
            }
        }
        return conflicts;
    }

    private static TimetableEntryDto MapEntryDto(TimetableEntry e) => new()
    {
        Id = e.Id, TimetableVersionId = e.TimetableVersionId,
        TeacherProfileId = e.TeacherProfileId,
        TeacherName = e.TeacherProfile.User.FirstName + " " + e.TeacherProfile.User.LastName,
        SubjectId = e.SubjectId, SubjectName = e.Subject.Name,
        ClassSectionId = e.ClassSectionId, ClassSectionName = e.ClassSection.Name,
        GradeId = e.GradeId, GradeName = e.Grade.Name,
        DayOfWeek = e.DayOfWeek, StartTime = e.StartTime, EndTime = e.EndTime, Room = e.Room
    };
}
