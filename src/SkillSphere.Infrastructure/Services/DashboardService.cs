using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Dashboard;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly SkillSphereDbContext _db;
    public DashboardService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<AdminDashboardDto>> GetAdminDashboardAsync(Guid tenantId, CancellationToken ct)
    {
        var currentSemester = await _db.Semesters.FirstOrDefaultAsync(s => s.SchoolTenantId == tenantId && s.IsCurrent, ct);

        var totalTeachers = await _db.TeacherProfiles.CountAsync(t => t.SchoolTenantId == tenantId, ct);
        var totalStudents = await _db.StudentProfiles.CountAsync(s => s.SchoolTenantId == tenantId, ct);
        var totalParents = await _db.ParentProfiles.CountAsync(p => p.SchoolTenantId == tenantId, ct);
        var openEscalations = await _db.InternalReports.CountAsync(r => r.SchoolTenantId == tenantId && r.Status == InternalReportStatus.Escalated, ct);
        var unresolvedReports = await _db.InternalReports.CountAsync(r => r.SchoolTenantId == tenantId && r.Status != InternalReportStatus.Resolved && r.Status != InternalReportStatus.Closed, ct);

        var notifications = await _db.NotificationEvents.Where(n => n.SchoolTenantId == tenantId).GroupBy(n => n.DeliveryStatus)
            .Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync(ct);

        return Result<AdminDashboardDto>.Success(new AdminDashboardDto
        {
            TotalTeachers = totalTeachers,
            TotalStudents = totalStudents,
            TotalParents = totalParents,
            OpenEscalations = openEscalations,
            UnresolvedInternalReports = unresolvedReports,
            NotificationStatus = new NotificationStatusSummary
            {
                TotalSent = notifications.Sum(n => n.Count),
                Delivered = notifications.FirstOrDefault(n => n.Status == NotificationDeliveryStatus.Delivered)?.Count ?? 0,
                Failed = notifications.FirstOrDefault(n => n.Status == NotificationDeliveryStatus.Failed)?.Count ?? 0,
                Pending = notifications.FirstOrDefault(n => n.Status == NotificationDeliveryStatus.Pending)?.Count ?? 0
            }
        });
    }

    public async Task<Result<ManagerDashboardDto>> GetManagerDashboardAsync(Guid tenantId, CancellationToken ct)
    {
        var currentSemester = await _db.Semesters.FirstOrDefaultAsync(s => s.SchoolTenantId == tenantId && s.IsCurrent, ct);

        var unresolvedReports = await _db.InternalReports.CountAsync(r =>
            r.SchoolTenantId == tenantId && r.Status != InternalReportStatus.Resolved && r.Status != InternalReportStatus.Closed && r.StudentProfileId != null, ct);

        // Count teachers who haven't submitted attendance today
        var totalTeacherAssignments = currentSemester != null
            ? await _db.TeacherAssignments.CountAsync(ta => ta.SemesterId == currentSemester.Id && ta.IsActive, ct)
            : 0;
        var attendanceToday = currentSemester != null
            ? await _db.AttendanceRecords.Where(a => a.SchoolTenantId == tenantId && a.Date.Date == DateTime.UtcNow.Date)
                .Select(a => a.TeacherProfileId).Distinct().CountAsync(ct)
            : 0;

        // Count missing weekly reports for current week
        var missingReports = 0;
        if (currentSemester != null)
        {
            var weekNum = (int)((DateTime.UtcNow - currentSemester.StartDate).TotalDays / 7) + 1;
            var submittedReports = await _db.WeeklyReports.CountAsync(wr =>
                wr.SemesterId == currentSemester.Id && wr.WeekNumber == weekNum && wr.Status >= WeeklyReportStatus.Submitted, ct);
            var expectedReports = totalTeacherAssignments;
            missingReports = Math.Max(0, expectedReports - submittedReports);
        }

        return Result<ManagerDashboardDto>.Success(new ManagerDashboardDto
        {
            MissingAttendance = Math.Max(0, totalTeacherAssignments - attendanceToday),
            MissingWeeklyReports = missingReports,
            StudentRiskQueue = unresolvedReports
        });
    }

    public async Task<Result<TeacherDashboardDto>> GetTeacherDashboardAsync(Guid tenantId, Guid teacherProfileId, CancellationToken ct)
    {
        var currentSemester = await _db.Semesters.FirstOrDefaultAsync(s => s.SchoolTenantId == tenantId && s.IsCurrent, ct);
        if (currentSemester == null) return Result<TeacherDashboardDto>.Success(new TeacherDashboardDto());

        var today = DateTime.UtcNow.DayOfWeek;
        var publishedVersion = await _db.TimetableVersions
            .FirstOrDefaultAsync(v => v.SemesterId == currentSemester.Id && v.Status == TimetableStatus.Published, ct);

        var todaySessions = new List<TodaySessionDto>();
        if (publishedVersion != null)
        {
            todaySessions = await _db.TimetableEntries
                .Include(e => e.Subject).Include(e => e.ClassSection).Include(e => e.Grade)
                .Where(e => e.TimetableVersionId == publishedVersion.Id && e.TeacherProfileId == teacherProfileId && e.DayOfWeek == today)
                .OrderBy(e => e.StartTime)
                .Select(e => new TodaySessionDto
                {
                    TimetableEntryId = e.Id, SubjectName = e.Subject.Name,
                    ClassName = e.ClassSection.Name, GradeName = e.Grade.Name,
                    StartTime = e.StartTime, EndTime = e.EndTime, Room = e.Room,
                    AttendanceSubmitted = _db.AttendanceRecords.Any(a =>
                        a.TeacherProfileId == teacherProfileId && a.SubjectId == e.SubjectId &&
                        a.ClassSectionId == e.ClassSectionId && a.Date.Date == DateTime.UtcNow.Date)
                }).ToListAsync(ct);
        }

        var totalStudents = await _db.TeacherAssignments
            .Where(ta => ta.TeacherProfileId == teacherProfileId && ta.SemesterId == currentSemester.Id && ta.IsActive)
            .SelectMany(ta => _db.StudentAssignments.Where(sa => sa.ClassSectionId == ta.ClassSectionId && sa.SemesterId == ta.SemesterId && sa.IsActive))
            .Select(sa => sa.StudentProfileId).Distinct().CountAsync(ct);

        return Result<TeacherDashboardDto>.Success(new TeacherDashboardDto
        {
            TodaySessions = todaySessions,
            AttendanceTasksDue = todaySessions.Count(s => !s.AttendanceSubmitted),
            TotalAssignedStudents = totalStudents
        });
    }

    public async Task<Result<SupervisorDashboardDto>> GetSupervisorDashboardAsync(Guid tenantId, Guid teacherProfileId, CancellationToken ct)
    {
        var inboxCount = await _db.InternalReports.CountAsync(r => r.AssignedSupervisorId == teacherProfileId && r.Status != InternalReportStatus.Resolved && r.Status != InternalReportStatus.Closed, ct);

        var trending = await _db.InternalReports
            .Where(r => r.SchoolTenantId == tenantId && r.AssignedSupervisorId == teacherProfileId && r.StudentProfileId != null)
            .GroupBy(r => new { r.StudentProfileId })
            .Select(g => new { StudentId = g.Key.StudentProfileId, Count = g.Count(), Latest = g.Max(r => r.Category) })
            .Where(g => g.Count > 1)
            .OrderByDescending(g => g.Count)
            .Take(10)
            .ToListAsync(ct);

        var trendingStudents = new List<TrendingStudentDto>();
        foreach (var t in trending)
        {
            var student = await _db.StudentProfiles.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == t.StudentId, ct);
            if (student != null)
            {
                trendingStudents.Add(new TrendingStudentDto
                {
                    StudentProfileId = student.Id,
                    StudentName = $"{student.User.FirstName} {student.User.LastName}",
                    ReportCount = t.Count,
                    LatestCategory = t.Latest.ToString()
                });
            }
        }

        return Result<SupervisorDashboardDto>.Success(new SupervisorDashboardDto
        {
            InternalReportsInbox = inboxCount,
            TrendingStudents = trendingStudents
        });
    }

    public async Task<Result<ParentDashboardDto>> GetParentDashboardAsync(Guid tenantId, Guid parentProfileId, CancellationToken ct)
    {
        var links = await _db.ParentLinks.Include(pl => pl.StudentProfile).ThenInclude(sp => sp.User)
            .Where(pl => pl.ParentProfileId == parentProfileId)
            .ToListAsync(ct);

        var cards = new List<StudentCardDto>();
        foreach (var link in links)
        {
            var assignment = await _db.StudentAssignments
                .Include(sa => sa.Grade).Include(sa => sa.ClassSection)
                .Where(sa => sa.StudentProfileId == link.StudentProfileId && sa.IsActive)
                .OrderByDescending(sa => sa.Semester.StartDate)
                .FirstOrDefaultAsync(ct);

            var reportCount = await _db.WeeklyReports.CountAsync(r => r.StudentProfileId == link.StudentProfileId && r.Status >= WeeklyReportStatus.Submitted, ct);
            var avgGrade = await _db.GradeRecords.Where(g => g.StudentProfileId == link.StudentProfileId && g.Score.HasValue).AverageAsync(g => (double?)g.Score, ct);

            cards.Add(new StudentCardDto
            {
                StudentProfileId = link.StudentProfile.Id,
                StudentName = $"{link.StudentProfile.User.FirstName} {link.StudentProfile.User.LastName}",
                GradeName = assignment?.Grade?.Name ?? "",
                ClassName = assignment?.ClassSection?.Name ?? "",
                TotalWeeklyReports = reportCount,
                AverageGrade = avgGrade
            });
        }

        return Result<ParentDashboardDto>.Success(new ParentDashboardDto { StudentCards = cards });
    }
}
