using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Reports;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class WeeklyReportService : IWeeklyReportService
{
    private readonly SkillSphereDbContext _db;
    public WeeklyReportService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<PagedResult<WeeklyReportDto>>> GetReportsAsync(Guid tenantId, Guid? semesterId, Guid? teacherId, Guid? studentId, int? weekNumber, PaginationParams? p, CancellationToken ct)
    {
        p ??= new PaginationParams();
        var q = _db.WeeklyReports
            .Include(r => r.StudentProfile).ThenInclude(s => s.User)
            .Include(r => r.TeacherProfile).ThenInclude(t => t.User)
            .Include(r => r.Subject).Include(r => r.Semester).Include(r => r.Items)
            .Where(r => r.SchoolTenantId == tenantId);

        if (semesterId.HasValue) q = q.Where(r => r.SemesterId == semesterId.Value);
        if (teacherId.HasValue) q = q.Where(r => r.TeacherProfileId == teacherId.Value);
        if (studentId.HasValue) q = q.Where(r => r.StudentProfileId == studentId.Value);
        if (weekNumber.HasValue) q = q.Where(r => r.WeekNumber == weekNumber.Value);

        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(r => r.WeekStartDate)
            .Skip((p.Page - 1) * p.PageSize).Take(p.PageSize)
            .ToListAsync(ct);
        var items = data.Select(MapDto).ToList();

        return Result<PagedResult<WeeklyReportDto>>.Success(new PagedResult<WeeklyReportDto>
        { Items = items, TotalCount = total, Page = p.Page, PageSize = p.PageSize });
    }

    public async Task<Result<WeeklyReportDto>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var r = await _db.WeeklyReports
            .Include(r => r.StudentProfile).ThenInclude(s => s.User)
            .Include(r => r.TeacherProfile).ThenInclude(t => t.User)
            .Include(r => r.Subject).Include(r => r.Semester).Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id, ct);

        return r == null ? Result<WeeklyReportDto>.Failure("Report not found.") : Result<WeeklyReportDto>.Success(MapDto(r));
    }

    public async Task<Result<WeeklyReportDto>> CreateAsync(Guid tenantId, Guid teacherProfileId, CreateWeeklyReportRequest req, CancellationToken ct)
    {
        if (await _db.WeeklyReports.AnyAsync(r =>
            r.StudentProfileId == req.StudentProfileId && r.SubjectId == req.SubjectId &&
            r.SemesterId == req.SemesterId && r.WeekNumber == req.WeekNumber, ct))
            return Result<WeeklyReportDto>.Failure("Report already exists for this student/subject/week.");

        var report = new WeeklyReport
        {
            StudentProfileId = req.StudentProfileId, TeacherProfileId = teacherProfileId,
            SubjectId = req.SubjectId, SemesterId = req.SemesterId,
            WeekNumber = req.WeekNumber, WeekStartDate = req.WeekStartDate, WeekEndDate = req.WeekEndDate,
            Status = WeeklyReportStatus.Draft, SchoolTenantId = tenantId,
            Items = req.Items.Select(i => new WeeklyReportItem
            {
                AttributeName = i.AttributeName, Value = i.Value,
                NumericValue = i.NumericValue, Comments = i.Comments
            }).ToList()
        };

        await _db.WeeklyReports.AddAsync(report, ct);
        await _db.SaveChangesAsync(ct);

        return Result<WeeklyReportDto>.Success(new WeeklyReportDto
        {
            Id = report.Id, StudentProfileId = report.StudentProfileId, SubjectId = report.SubjectId,
            SemesterId = report.SemesterId, WeekNumber = report.WeekNumber,
            WeekStartDate = report.WeekStartDate, WeekEndDate = report.WeekEndDate,
            Status = report.Status,
            Items = report.Items.Select(i => new WeeklyReportItemDto
            {
                Id = i.Id, AttributeName = i.AttributeName, Value = i.Value,
                NumericValue = i.NumericValue, Comments = i.Comments
            }).ToList()
        });
    }

    public async Task<Result> SubmitAsync(Guid id, CancellationToken ct)
    {
        var report = await _db.WeeklyReports.FindAsync([id], ct);
        if (report == null) return Result.Failure("Report not found.");
        report.Status = WeeklyReportStatus.Submitted;
        report.SubmittedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<List<WeeklyReportComplianceDto>>> GetComplianceAsync(Guid tenantId, Guid semesterId, int weekNumber, CancellationToken ct)
    {
        var teachers = await _db.TeacherProfiles.Include(t => t.User)
            .Where(t => t.SchoolTenantId == tenantId && t.User.IsActive)
            .ToListAsync(ct);

        var result = new List<WeeklyReportComplianceDto>();
        foreach (var teacher in teachers)
        {
            var assignedStudentCount = await _db.TeacherAssignments
                .Where(ta => ta.TeacherProfileId == teacher.Id && ta.SemesterId == semesterId && ta.IsActive)
                .SelectMany(ta => _db.StudentAssignments.Where(sa => sa.ClassSectionId == ta.ClassSectionId && sa.SemesterId == ta.SemesterId && sa.IsActive))
                .Select(sa => sa.StudentProfileId).Distinct().CountAsync(ct);

            var submitted = await _db.WeeklyReports
                .CountAsync(r => r.TeacherProfileId == teacher.Id && r.SemesterId == semesterId && r.WeekNumber == weekNumber && r.Status >= WeeklyReportStatus.Submitted, ct);

            result.Add(new WeeklyReportComplianceDto
            {
                TeacherProfileId = teacher.Id,
                TeacherName = $"{teacher.User.FirstName} {teacher.User.LastName}",
                TotalExpected = assignedStudentCount,
                Submitted = submitted,
                CompletionPercentage = assignedStudentCount > 0 ? Math.Round((double)submitted / assignedStudentCount * 100, 1) : 0
            });
        }
        return Result<List<WeeklyReportComplianceDto>>.Success(result);
    }

    public async Task<Result<List<WeeklyReportDto>>> GetParentReportsAsync(Guid parentProfileId, Guid studentProfileId, CancellationToken ct)
    {
        var isLinked = await _db.ParentLinks.AnyAsync(pl => pl.ParentProfileId == parentProfileId && pl.StudentProfileId == studentProfileId, ct);
        if (!isLinked) return Result<List<WeeklyReportDto>>.Failure("Access denied.");

        var reports = await _db.WeeklyReports
            .Include(r => r.StudentProfile).ThenInclude(s => s.User)
            .Include(r => r.TeacherProfile).ThenInclude(t => t.User)
            .Include(r => r.Subject).Include(r => r.Semester).Include(r => r.Items)
            .Where(r => r.StudentProfileId == studentProfileId && r.Status >= WeeklyReportStatus.Submitted)
            .OrderByDescending(r => r.WeekStartDate)
            .ToListAsync(ct);

        return Result<List<WeeklyReportDto>>.Success(reports.Select(MapDto).ToList());
    }

    private static WeeklyReportDto MapDto(WeeklyReport r) => new()
    {
        Id = r.Id, StudentProfileId = r.StudentProfileId,
        StudentName = r.StudentProfile != null ? $"{r.StudentProfile.User.FirstName} {r.StudentProfile.User.LastName}" : "",
        SubjectId = r.SubjectId, SubjectName = r.Subject?.Name ?? "",
        TeacherName = r.TeacherProfile != null ? $"{r.TeacherProfile.User.FirstName} {r.TeacherProfile.User.LastName}" : "",
        SemesterId = r.SemesterId, SemesterName = r.Semester?.Name ?? "",
        WeekNumber = r.WeekNumber, WeekStartDate = r.WeekStartDate, WeekEndDate = r.WeekEndDate,
        Status = r.Status, SubmittedAt = r.SubmittedAt,
        Items = r.Items?.Select(i => new WeeklyReportItemDto
        {
            Id = i.Id, AttributeName = i.AttributeName, Value = i.Value,
            NumericValue = i.NumericValue, Comments = i.Comments
        }).ToList() ?? []
    };
}
