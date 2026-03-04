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

    // --- Versions ---

    public async Task<Result<List<TimetableVersionDto>>> GetVersionsAsync(Guid tenantId, Guid? groupId, Guid? semesterId, CancellationToken ct)
    {
        var q = _db.TimetableVersions
            .Include(v => v.Group).Include(v => v.Semester).Include(v => v.Entries)
            .Where(v => v.SchoolTenantId == tenantId);

        if (groupId.HasValue) q = q.Where(v => v.GroupId == groupId.Value);
        if (semesterId.HasValue) q = q.Where(v => v.SemesterId == semesterId.Value);

        var items = await q.OrderByDescending(v => v.CreatedAt).Select(v => new TimetableVersionDto
        {
            Id = v.Id, Name = v.Name, GroupId = v.GroupId, GroupName = v.Group.Name,
            SemesterId = v.SemesterId, SemesterName = v.Semester.Name,
            VersionNumber = v.VersionNumber, Status = v.Status, PublishedAt = v.PublishedAt,
            EntryCount = v.Entries.Count
        }).ToListAsync(ct);

        return Result<List<TimetableVersionDto>>.Success(items);
    }

    public async Task<Result<TimetableVersionDto>> CreateVersionAsync(Guid tenantId, CreateTimetableVersionRequest req, CancellationToken ct)
    {
        var maxVersion = await _db.TimetableVersions
            .Where(v => v.SchoolTenantId == tenantId && v.GroupId == req.GroupId && v.SemesterId == req.SemesterId)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        var version = new TimetableVersion
        {
            Name = req.Name, GroupId = req.GroupId, SemesterId = req.SemesterId,
            VersionNumber = maxVersion + 1, Status = TimetableStatus.Draft, SchoolTenantId = tenantId
        };
        await _db.TimetableVersions.AddAsync(version, ct);
        await _db.SaveChangesAsync(ct);

        var group = await _db.Groups.FindAsync([req.GroupId], ct);
        var semester = await _db.Semesters.FindAsync([req.SemesterId], ct);

        return Result<TimetableVersionDto>.Success(new TimetableVersionDto
        {
            Id = version.Id, Name = version.Name, GroupId = version.GroupId, GroupName = group?.Name ?? "",
            SemesterId = version.SemesterId, SemesterName = semester?.Name ?? "",
            VersionNumber = version.VersionNumber, Status = version.Status
        });
    }

    // --- Entries ---

    public async Task<Result<List<TimetableEntryDto>>> GetEntriesAsync(Guid versionId, CancellationToken ct)
    {
        var data = await _db.TimetableEntries
            .Include(e => e.Subject).Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Room).Include(e => e.PeriodDefinition)
            .Where(e => e.TimetableVersionId == versionId)
            .OrderBy(e => e.DayOfWeek).ThenBy(e => e.PeriodDefinition.PeriodNumber)
            .ToListAsync(ct);

        return Result<List<TimetableEntryDto>>.Success(data.Select(MapEntryDto).ToList());
    }

    public async Task<Result<TimetableEntryDto>> AddEntryAsync(Guid tenantId, AddTimetableEntryRequest req, CancellationToken ct)
    {
        // Load the version to ensure it's in Draft
        var version = await _db.TimetableVersions.Include(v => v.Group).FirstOrDefaultAsync(v => v.Id == req.TimetableVersionId, ct);
        if (version == null) return Result<TimetableEntryDto>.Failure("Timetable version not found.");
        if (version.Status != TimetableStatus.Draft) return Result<TimetableEntryDto>.Failure("Can only add entries to draft versions.");

        // Validate period is not a break
        var period = await _db.PeriodDefinitions.FindAsync([req.PeriodDefinitionId], ct);
        if (period == null) return Result<TimetableEntryDto>.Failure("Period definition not found.");
        if (period.IsBreak) return Result<TimetableEntryDto>.Failure("Cannot schedule an entry during a break period.");

        // Validate working day
        var tenant = await _db.SchoolTenants.FindAsync([tenantId], ct);
        if (tenant != null && !IsWorkingDay(tenant.WorkingDays, req.DayOfWeek))
            return Result<TimetableEntryDto>.Failure($"{req.DayOfWeek} is not a working day.");

        // Check slot uniqueness within this version
        if (await _db.TimetableEntries.AnyAsync(e =>
            e.TimetableVersionId == req.TimetableVersionId &&
            e.DayOfWeek == req.DayOfWeek && e.PeriodDefinitionId == req.PeriodDefinitionId, ct))
            return Result<TimetableEntryDto>.Failure("This time slot is already occupied in this version.");

        var entry = new TimetableEntry
        {
            TimetableVersionId = req.TimetableVersionId, SubjectId = req.SubjectId,
            TeacherProfileId = req.TeacherProfileId, RoomId = req.RoomId,
            DayOfWeek = req.DayOfWeek, PeriodDefinitionId = req.PeriodDefinitionId,
            SchoolTenantId = tenantId
        };
        await _db.TimetableEntries.AddAsync(entry, ct);
        await _db.SaveChangesAsync(ct);

        // Load nav properties for response
        await _db.Entry(entry).Reference(e => e.Subject).LoadAsync(ct);
        await _db.Entry(entry).Reference(e => e.TeacherProfile).LoadAsync(ct);
        await _db.Entry(entry.TeacherProfile).Reference(t => t.User).LoadAsync(ct);
        await _db.Entry(entry).Reference(e => e.Room).LoadAsync(ct);
        await _db.Entry(entry).Reference(e => e.PeriodDefinition).LoadAsync(ct);

        return Result<TimetableEntryDto>.Success(MapEntryDto(entry));
    }

    public async Task<Result> RemoveEntryAsync(Guid entryId, CancellationToken ct)
    {
        var entry = await _db.TimetableEntries.Include(e => e.TimetableVersion).FirstOrDefaultAsync(e => e.Id == entryId, ct);
        if (entry == null) return Result.Failure("Entry not found.");
        if (entry.TimetableVersion.Status != TimetableStatus.Draft) return Result.Failure("Can only remove entries from draft versions.");
        entry.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    // --- Validation & Publication ---

    public async Task<Result<List<TimetableValidationError>>> ValidateForPublicationAsync(Guid versionId, CancellationToken ct)
    {
        var version = await _db.TimetableVersions
            .Include(v => v.Group).ThenInclude(g => g.Grade)
            .Include(v => v.Semester)
            .FirstOrDefaultAsync(v => v.Id == versionId, ct);
        if (version == null) return Result<List<TimetableValidationError>>.Failure("Version not found.");

        var entries = await _db.TimetableEntries
            .Include(e => e.Subject).Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Room).Include(e => e.PeriodDefinition)
            .Where(e => e.TimetableVersionId == versionId)
            .ToListAsync(ct);

        var errors = new List<TimetableValidationError>();

        // Get all OTHER published versions for the same semester (for cross-group checks)
        var otherPublishedEntries = await _db.TimetableEntries
            .Include(e => e.TimetableVersion).ThenInclude(v => v.Group)
            .Include(e => e.Subject).Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Room)
            .Where(e => e.TimetableVersion.SemesterId == version.SemesterId &&
                        e.TimetableVersion.Status == TimetableStatus.Published &&
                        e.TimetableVersionId != versionId)
            .ToListAsync(ct);

        // Rule 1: Curriculum Fulfillment
        var contracts = await _db.CurriculumContracts
            .Include(c => c.Subject)
            .Where(c => c.SchoolTenantId == version.SchoolTenantId &&
                        c.GradeId == version.Group.GradeId && c.SemesterId == version.SemesterId)
            .ToListAsync(ct);

        foreach (var contract in contracts)
        {
            var actual = entries.Count(e => e.SubjectId == contract.SubjectId);
            if (actual != contract.PeriodsPerWeek)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "CurriculumFulfillment", Severity = "Error",
                    Message = $"Subject '{contract.Subject.Name}' requires {contract.PeriodsPerWeek} periods/week, but {actual} are scheduled."
                });
            }
        }

        // Warn about scheduled subjects without contracts
        var contractSubjectIds = contracts.Select(c => c.SubjectId).ToHashSet();
        var scheduledSubjectIds = entries.Select(e => e.SubjectId).Distinct();
        foreach (var subjectId in scheduledSubjectIds.Where(s => !contractSubjectIds.Contains(s)))
        {
            var subject = entries.First(e => e.SubjectId == subjectId).Subject;
            errors.Add(new TimetableValidationError
            {
                Rule = "CurriculumFulfillment", Severity = "Warning",
                Message = $"Subject '{subject.Name}' is scheduled but has no curriculum contract."
            });
        }

        // Rule 2: Teacher Time Conflict (Cross-Group)
        foreach (var entry in entries)
        {
            var conflict = otherPublishedEntries.FirstOrDefault(o =>
                o.TeacherProfileId == entry.TeacherProfileId &&
                o.DayOfWeek == entry.DayOfWeek &&
                o.PeriodDefinitionId == entry.PeriodDefinitionId);
            if (conflict != null)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "TeacherConflict", Severity = "Error",
                    Message = $"Teacher '{entry.TeacherProfile.User.FirstName} {entry.TeacherProfile.User.LastName}' is already scheduled at {entry.DayOfWeek} {entry.PeriodDefinition.Label} for Group '{conflict.TimetableVersion.Group.Name}'."
                });
            }
        }

        // Rule 3: Room Time Conflict (Cross-Group)
        foreach (var entry in entries)
        {
            var conflict = otherPublishedEntries.FirstOrDefault(o =>
                o.RoomId == entry.RoomId &&
                o.DayOfWeek == entry.DayOfWeek &&
                o.PeriodDefinitionId == entry.PeriodDefinitionId);
            if (conflict != null)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "RoomConflict", Severity = "Error",
                    Message = $"Room '{entry.Room.Name}' is already booked at {entry.DayOfWeek} {entry.PeriodDefinition.Label} by Group '{conflict.TimetableVersion.Group.Name}'."
                });
            }
        }

        // Rule 4: Teacher Daily Limit & Rule 5: Teacher Weekly Limit
        var teacherIds = entries.Select(e => e.TeacherProfileId).Distinct().ToList();
        foreach (var teacherId in teacherIds)
        {
            var teacher = entries.First(e => e.TeacherProfileId == teacherId).TeacherProfile;
            var thisVersionEntries = entries.Where(e => e.TeacherProfileId == teacherId).ToList();
            var otherEntries = otherPublishedEntries.Where(e => e.TeacherProfileId == teacherId).ToList();
            var allEntries = thisVersionEntries.Concat(otherEntries).ToList();

            // Daily limit
            var dailyGroups = allEntries.GroupBy(e => e.DayOfWeek);
            foreach (var dayGroup in dailyGroups)
            {
                if (dayGroup.Count() > teacher.MaxPeriodsPerDay)
                {
                    errors.Add(new TimetableValidationError
                    {
                        Rule = "TeacherDailyLimit", Severity = "Error",
                        Message = $"Teacher '{teacher.User.FirstName} {teacher.User.LastName}' has {dayGroup.Count()} periods on {dayGroup.Key}, exceeding limit of {teacher.MaxPeriodsPerDay}."
                    });
                }
            }

            // Weekly limit
            if (allEntries.Count > teacher.MaxPeriodsPerWeek)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "TeacherWeeklyLimit", Severity = "Error",
                    Message = $"Teacher '{teacher.User.FirstName} {teacher.User.LastName}' has {allEntries.Count} periods/week, exceeding limit of {teacher.MaxPeriodsPerWeek}."
                });
            }
        }

        // Rule 6: Room Type Match
        foreach (var entry in entries)
        {
            if (entry.Subject.RequiredRoomType.HasValue && entry.Room.RoomType != entry.Subject.RequiredRoomType.Value)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "RoomTypeMatch", Severity = "Error",
                    Message = $"Subject '{entry.Subject.Name}' requires a {entry.Subject.RequiredRoomType} but is assigned to '{entry.Room.Name}' ({entry.Room.RoomType})."
                });
            }
        }

        // Rule 7: Room Capacity
        var groupStudentCount = await _db.StudentAssignments.CountAsync(sa =>
            sa.GroupId == version.GroupId && sa.SemesterId == version.SemesterId && sa.IsActive, ct);
        foreach (var entry in entries)
        {
            if (groupStudentCount > entry.Room.Capacity)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "RoomCapacity", Severity = "Error",
                    Message = $"Room '{entry.Room.Name}' (capacity {entry.Room.Capacity}) cannot fit Group '{version.Group.Name}' ({groupStudentCount} students)."
                });
                break; // Only report once per version for room capacity
            }
        }

        // Rule 8: Teacher Qualification
        var links = await _db.TeacherSubjectLinks.Where(l => l.SchoolTenantId == version.SchoolTenantId && l.IsActive).ToListAsync(ct);
        foreach (var entry in entries)
        {
            var qualified = links.Any(l =>
                l.TeacherProfileId == entry.TeacherProfileId &&
                l.SubjectId == entry.SubjectId &&
                (!l.GradeId.HasValue || l.GradeId == version.Group.GradeId));
            if (!qualified)
            {
                errors.Add(new TimetableValidationError
                {
                    Rule = "TeacherQualification", Severity = "Error",
                    Message = $"Teacher '{entry.TeacherProfile.User.FirstName} {entry.TeacherProfile.User.LastName}' is not qualified to teach '{entry.Subject.Name}' for {version.Group.Grade.Name}."
                });
            }
        }

        return Result<List<TimetableValidationError>>.Success(errors);
    }

    public async Task<Result> PublishAsync(Guid versionId, string publishedBy, CancellationToken ct)
    {
        var validation = await ValidateForPublicationAsync(versionId, ct);
        if (!validation.IsSuccess) return Result.Failure(validation.Error ?? "Validation failed.");

        var errorCount = validation.Data!.Count(e => e.Severity == "Error");
        if (errorCount > 0)
            return Result.Failure(validation.Data!.Where(e => e.Severity == "Error").Select(e => e.Message).ToList());

        var version = await _db.TimetableVersions.FindAsync([versionId], ct);
        if (version == null) return Result.Failure("Version not found.");

        // Archive previous published version for same group+semester
        var previous = await _db.TimetableVersions.Where(v =>
            v.GroupId == version.GroupId && v.SemesterId == version.SemesterId &&
            v.Status == TimetableStatus.Published && v.Id != versionId).ToListAsync(ct);
        previous.ForEach(v => v.Status = TimetableStatus.Archived);

        version.Status = TimetableStatus.Published;
        version.PublishedAt = DateTime.UtcNow;
        version.PublishedBy = publishedBy;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> ArchiveAsync(Guid versionId, CancellationToken ct)
    {
        var version = await _db.TimetableVersions.FindAsync([versionId], ct);
        if (version == null) return Result.Failure("Version not found.");
        version.Status = TimetableStatus.Archived;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    // --- Query ---

    public async Task<Result<List<TimetableEntryDto>>> GetTeacherScheduleAsync(Guid teacherProfileId, Guid semesterId, CancellationToken ct)
    {
        var data = await _db.TimetableEntries
            .Include(e => e.TimetableVersion)
            .Include(e => e.Subject).Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Room).Include(e => e.PeriodDefinition)
            .Where(e => e.TimetableVersion.SemesterId == semesterId &&
                        e.TimetableVersion.Status == TimetableStatus.Published &&
                        e.TeacherProfileId == teacherProfileId)
            .OrderBy(e => e.DayOfWeek).ThenBy(e => e.PeriodDefinition.PeriodNumber)
            .ToListAsync(ct);

        return Result<List<TimetableEntryDto>>.Success(data.Select(MapEntryDto).ToList());
    }

    public async Task<Result<List<TimetableEntryDto>>> GetGroupScheduleAsync(Guid groupId, Guid semesterId, CancellationToken ct)
    {
        var data = await _db.TimetableEntries
            .Include(e => e.TimetableVersion)
            .Include(e => e.Subject).Include(e => e.TeacherProfile).ThenInclude(t => t.User)
            .Include(e => e.Room).Include(e => e.PeriodDefinition)
            .Where(e => e.TimetableVersion.GroupId == groupId &&
                        e.TimetableVersion.SemesterId == semesterId &&
                        e.TimetableVersion.Status == TimetableStatus.Published)
            .OrderBy(e => e.DayOfWeek).ThenBy(e => e.PeriodDefinition.PeriodNumber)
            .ToListAsync(ct);

        return Result<List<TimetableEntryDto>>.Success(data.Select(MapEntryDto).ToList());
    }

    // --- Helpers ---

    private static bool IsWorkingDay(DayOfWeekFlag workingDays, DayOfWeek day)
    {
        var flag = day switch
        {
            DayOfWeek.Sunday => DayOfWeekFlag.Sunday,
            DayOfWeek.Monday => DayOfWeekFlag.Monday,
            DayOfWeek.Tuesday => DayOfWeekFlag.Tuesday,
            DayOfWeek.Wednesday => DayOfWeekFlag.Wednesday,
            DayOfWeek.Thursday => DayOfWeekFlag.Thursday,
            DayOfWeek.Friday => DayOfWeekFlag.Friday,
            DayOfWeek.Saturday => DayOfWeekFlag.Saturday,
            _ => (DayOfWeekFlag)0
        };
        return (workingDays & flag) != 0;
    }

    private static TimetableEntryDto MapEntryDto(TimetableEntry e) => new()
    {
        Id = e.Id, TimetableVersionId = e.TimetableVersionId,
        SubjectId = e.SubjectId, SubjectName = e.Subject.Name,
        TeacherProfileId = e.TeacherProfileId,
        TeacherName = e.TeacherProfile.User.FirstName + " " + e.TeacherProfile.User.LastName,
        RoomId = e.RoomId, RoomName = e.Room.Name, RoomType = e.Room.RoomType,
        DayOfWeek = e.DayOfWeek,
        PeriodDefinitionId = e.PeriodDefinitionId, PeriodNumber = e.PeriodDefinition.PeriodNumber,
        PeriodLabel = e.PeriodDefinition.Label, StartTime = e.PeriodDefinition.StartTime, EndTime = e.PeriodDefinition.EndTime
    };
}
