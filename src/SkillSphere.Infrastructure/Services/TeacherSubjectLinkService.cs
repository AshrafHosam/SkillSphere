using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.TeacherSubjectLinks;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class TeacherSubjectLinkService : ITeacherSubjectLinkService
{
    private readonly SkillSphereDbContext _db;
    public TeacherSubjectLinkService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<List<TeacherSubjectLinkDto>>> GetLinksAsync(Guid tenantId, Guid? teacherProfileId, CancellationToken ct)
    {
        var q = _db.TeacherSubjectLinks
            .Include(l => l.TeacherProfile).ThenInclude(t => t.User)
            .Include(l => l.Subject).Include(l => l.Grade)
            .Where(l => l.SchoolTenantId == tenantId);

        if (teacherProfileId.HasValue) q = q.Where(l => l.TeacherProfileId == teacherProfileId.Value);

        var items = await q.OrderBy(l => l.TeacherProfile.User.LastName).ThenBy(l => l.Subject.Name)
            .Select(l => new TeacherSubjectLinkDto
            {
                Id = l.Id, TeacherProfileId = l.TeacherProfileId,
                TeacherName = l.TeacherProfile.User.FirstName + " " + l.TeacherProfile.User.LastName,
                SubjectId = l.SubjectId, SubjectName = l.Subject.Name,
                GradeId = l.GradeId, GradeName = l.Grade != null ? l.Grade.Name : null,
                IsActive = l.IsActive
            }).ToListAsync(ct);
        return Result<List<TeacherSubjectLinkDto>>.Success(items);
    }

    public async Task<Result<TeacherSubjectLinkDto>> CreateAsync(Guid tenantId, CreateTeacherSubjectLinkRequest req, CancellationToken ct)
    {
        // Check for duplicate
        if (await _db.TeacherSubjectLinks.AnyAsync(l =>
            l.SchoolTenantId == tenantId && l.TeacherProfileId == req.TeacherProfileId &&
            l.SubjectId == req.SubjectId && l.GradeId == req.GradeId && l.IsActive, ct))
            return Result<TeacherSubjectLinkDto>.Failure("This teacher-subject link already exists.");

        var link = new TeacherSubjectLink
        {
            TeacherProfileId = req.TeacherProfileId, SubjectId = req.SubjectId,
            GradeId = req.GradeId, SchoolTenantId = tenantId
        };
        await _db.TeacherSubjectLinks.AddAsync(link, ct);
        await _db.SaveChangesAsync(ct);

        var teacher = await _db.TeacherProfiles.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == req.TeacherProfileId, ct);
        var subject = await _db.Subjects.FindAsync([req.SubjectId], ct);
        var grade = req.GradeId.HasValue ? await _db.Grades.FindAsync([req.GradeId.Value], ct) : null;

        return Result<TeacherSubjectLinkDto>.Success(new TeacherSubjectLinkDto
        {
            Id = link.Id, TeacherProfileId = link.TeacherProfileId,
            TeacherName = teacher != null ? $"{teacher.User.FirstName} {teacher.User.LastName}" : "",
            SubjectId = link.SubjectId, SubjectName = subject?.Name ?? "",
            GradeId = link.GradeId, GradeName = grade?.Name, IsActive = true
        });
    }

    public async Task<Result> RemoveAsync(Guid id, CancellationToken ct)
    {
        var link = await _db.TeacherSubjectLinks.FindAsync([id], ct);
        if (link == null) return Result.Failure("Teacher subject link not found.");
        link.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
