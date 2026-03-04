using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Attendance;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class AttendanceService : IAttendanceService
{
    private readonly SkillSphereDbContext _db;
    public AttendanceService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<List<AttendanceRecordDto>>> GetAttendanceAsync(Guid tenantId, DateTime date, Guid? groupId, Guid? subjectId, CancellationToken ct)
    {
        var q = _db.AttendanceRecords
            .Include(a => a.StudentProfile).ThenInclude(s => s.User)
            .Include(a => a.Subject).Include(a => a.Group)
            .Where(a => a.SchoolTenantId == tenantId && a.Date.Date == date.Date);

        if (groupId.HasValue) q = q.Where(a => a.GroupId == groupId.Value);
        if (subjectId.HasValue) q = q.Where(a => a.SubjectId == subjectId.Value);

        var items = await q.OrderBy(a => a.StudentProfile.User.LastName).Select(a => new AttendanceRecordDto
        {
            Id = a.Id, StudentProfileId = a.StudentProfileId,
            StudentName = a.StudentProfile.User.FirstName + " " + a.StudentProfile.User.LastName,
            SubjectId = a.SubjectId, SubjectName = a.Subject.Name,
            GroupId = a.GroupId, GroupName = a.Group.Name,
            Date = a.Date, SessionTime = a.SessionTime, Status = a.Status, Notes = a.Notes
        }).ToListAsync(ct);

        return Result<List<AttendanceRecordDto>>.Success(items);
    }

    public async Task<Result> SubmitAttendanceAsync(Guid tenantId, Guid teacherProfileId, SubmitAttendanceRequest req, CancellationToken ct)
    {
        // Validate that teacher has a published timetable entry for this subject+group on the given day
        var dayOfWeek = req.Date.DayOfWeek;
        var hasEntry = await _db.TimetableEntries
            .Include(e => e.TimetableVersion)
            .AnyAsync(e => e.TimetableVersion.Status == TimetableStatus.Published &&
                          e.TeacherProfileId == teacherProfileId &&
                          e.SubjectId == req.SubjectId &&
                          e.TimetableVersion.GroupId == req.GroupId &&
                          e.DayOfWeek == dayOfWeek, ct);

        if (!hasEntry)
            return Result.Failure("No published timetable entry found for this teacher, subject, and group on this day.");

        var records = req.Entries.Select(e => new AttendanceRecord
        {
            StudentProfileId = e.StudentProfileId, TeacherProfileId = teacherProfileId,
            SubjectId = req.SubjectId, GroupId = req.GroupId,
            SemesterId = req.SemesterId, Date = req.Date, SessionTime = req.SessionTime,
            Status = e.Status, Notes = e.Notes, SchoolTenantId = tenantId
        });

        await _db.AttendanceRecords.AddRangeAsync(records, ct);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<List<AttendanceRecordDto>>> GetStudentAttendanceAsync(Guid studentProfileId, Guid semesterId, CancellationToken ct)
    {
        var items = await _db.AttendanceRecords
            .Include(a => a.StudentProfile).ThenInclude(s => s.User)
            .Include(a => a.Subject).Include(a => a.Group)
            .Where(a => a.StudentProfileId == studentProfileId && a.SemesterId == semesterId)
            .OrderByDescending(a => a.Date)
            .Select(a => new AttendanceRecordDto
            {
                Id = a.Id, StudentProfileId = a.StudentProfileId,
                StudentName = a.StudentProfile.User.FirstName + " " + a.StudentProfile.User.LastName,
                SubjectId = a.SubjectId, SubjectName = a.Subject.Name,
                GroupId = a.GroupId, GroupName = a.Group.Name,
                Date = a.Date, SessionTime = a.SessionTime, Status = a.Status, Notes = a.Notes
            }).ToListAsync(ct);

        return Result<List<AttendanceRecordDto>>.Success(items);
    }

    public async Task<Result<List<AttendanceComplianceDto>>> GetComplianceAsync(Guid tenantId, Guid semesterId, CancellationToken ct)
    {
        var teachers = await _db.TeacherProfiles.Include(t => t.User)
            .Where(t => t.SchoolTenantId == tenantId && t.User.IsActive)
            .ToListAsync(ct);

        var result = new List<AttendanceComplianceDto>();
        foreach (var teacher in teachers)
        {
            // Count expected sessions from published timetable entries
            var publishedEntries = await _db.TimetableEntries
                .Include(e => e.TimetableVersion)
                .CountAsync(e => e.TimetableVersion.SemesterId == semesterId &&
                                 e.TimetableVersion.Status == TimetableStatus.Published &&
                                 e.TeacherProfileId == teacher.Id, ct);
            var submitted = await _db.AttendanceRecords
                .Where(a => a.TeacherProfileId == teacher.Id && a.SemesterId == semesterId)
                .Select(a => a.Date).Distinct().CountAsync(ct);

            result.Add(new AttendanceComplianceDto
            {
                TeacherProfileId = teacher.Id,
                TeacherName = $"{teacher.User.FirstName} {teacher.User.LastName}",
                TotalExpectedSessions = publishedEntries,
                CompletedSessions = submitted,
                CompletionPercentage = publishedEntries > 0 ? Math.Round((double)submitted / publishedEntries * 100, 1) : 0
            });
        }

        return Result<List<AttendanceComplianceDto>>.Success(result);
    }
}
