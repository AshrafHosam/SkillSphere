using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Assignments;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly SkillSphereDbContext _db;
    public AssignmentService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<List<StudentAssignmentDto>>> GetStudentAssignmentsAsync(Guid tenantId, Guid? semesterId, Guid? gradeId, Guid? groupId, CancellationToken ct)
    {
        var q = _db.StudentAssignments
            .Include(sa => sa.StudentProfile).ThenInclude(sp => sp.User)
            .Include(sa => sa.Grade).Include(sa => sa.Group).Include(sa => sa.Semester)
            .Where(sa => sa.SchoolTenantId == tenantId);

        if (semesterId.HasValue) q = q.Where(sa => sa.SemesterId == semesterId.Value);
        if (gradeId.HasValue) q = q.Where(sa => sa.GradeId == gradeId.Value);
        if (groupId.HasValue) q = q.Where(sa => sa.GroupId == groupId.Value);

        var items = await q.Select(sa => new StudentAssignmentDto
        {
            Id = sa.Id, StudentProfileId = sa.StudentProfileId,
            StudentName = sa.StudentProfile.User.FirstName + " " + sa.StudentProfile.User.LastName,
            GradeId = sa.GradeId, GradeName = sa.Grade.Name,
            GroupId = sa.GroupId, GroupName = sa.Group.Name,
            SemesterId = sa.SemesterId, SemesterName = sa.Semester.Name, IsActive = sa.IsActive
        }).ToListAsync(ct);

        return Result<List<StudentAssignmentDto>>.Success(items);
    }

    public async Task<Result<StudentAssignmentDto>> CreateStudentAssignmentAsync(Guid tenantId, CreateStudentAssignmentRequest req, CancellationToken ct)
    {
        if (await _db.StudentAssignments.AnyAsync(sa => sa.StudentProfileId == req.StudentProfileId && sa.SemesterId == req.SemesterId && sa.IsActive, ct))
            return Result<StudentAssignmentDto>.Failure("Student already assigned for this semester.");

        var sa = new StudentAssignment
        {
            StudentProfileId = req.StudentProfileId, GradeId = req.GradeId,
            GroupId = req.GroupId, SemesterId = req.SemesterId,
            SchoolTenantId = tenantId
        };
        await _db.StudentAssignments.AddAsync(sa, ct);
        await _db.SaveChangesAsync(ct);

        return Result<StudentAssignmentDto>.Success(new StudentAssignmentDto
        {
            Id = sa.Id, StudentProfileId = sa.StudentProfileId,
            GradeId = sa.GradeId, GroupId = sa.GroupId,
            SemesterId = sa.SemesterId, IsActive = true
        });
    }

    public async Task<Result> RemoveStudentAssignmentAsync(Guid id, CancellationToken ct)
    {
        var sa = await _db.StudentAssignments.FindAsync([id], ct);
        if (sa == null) return Result.Failure("Assignment not found.");
        sa.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
