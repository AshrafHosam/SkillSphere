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

    public async Task<Result<List<StudentAssignmentDto>>> GetStudentAssignmentsAsync(Guid tenantId, Guid? semesterId, Guid? gradeId, Guid? classId, CancellationToken ct)
    {
        var q = _db.StudentAssignments
            .Include(sa => sa.StudentProfile).ThenInclude(sp => sp.User)
            .Include(sa => sa.Grade).Include(sa => sa.ClassSection).Include(sa => sa.Semester)
            .Where(sa => sa.SchoolTenantId == tenantId);

        if (semesterId.HasValue) q = q.Where(sa => sa.SemesterId == semesterId.Value);
        if (gradeId.HasValue) q = q.Where(sa => sa.GradeId == gradeId.Value);
        if (classId.HasValue) q = q.Where(sa => sa.ClassSectionId == classId.Value);

        var items = await q.Select(sa => new StudentAssignmentDto
        {
            Id = sa.Id, StudentProfileId = sa.StudentProfileId,
            StudentName = sa.StudentProfile.User.FirstName + " " + sa.StudentProfile.User.LastName,
            GradeId = sa.GradeId, GradeName = sa.Grade.Name,
            ClassSectionId = sa.ClassSectionId, ClassSectionName = sa.ClassSection.Name,
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
            ClassSectionId = req.ClassSectionId, SemesterId = req.SemesterId,
            SchoolTenantId = tenantId
        };
        await _db.StudentAssignments.AddAsync(sa, ct);
        await _db.SaveChangesAsync(ct);

        return Result<StudentAssignmentDto>.Success(new StudentAssignmentDto { Id = sa.Id, StudentProfileId = sa.StudentProfileId, GradeId = sa.GradeId, ClassSectionId = sa.ClassSectionId, SemesterId = sa.SemesterId, IsActive = true });
    }

    public async Task<Result> RemoveStudentAssignmentAsync(Guid id, CancellationToken ct)
    {
        var sa = await _db.StudentAssignments.FindAsync([id], ct);
        if (sa == null) return Result.Failure("Assignment not found.");
        sa.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<List<TeacherAssignmentDto>>> GetTeacherAssignmentsAsync(Guid tenantId, Guid? semesterId, Guid? teacherId, CancellationToken ct)
    {
        var q = _db.TeacherAssignments
            .Include(ta => ta.TeacherProfile).ThenInclude(tp => tp.User)
            .Include(ta => ta.Subject).Include(ta => ta.ClassSection).Include(ta => ta.Grade).Include(ta => ta.Semester)
            .Where(ta => ta.SchoolTenantId == tenantId);

        if (semesterId.HasValue) q = q.Where(ta => ta.SemesterId == semesterId.Value);
        if (teacherId.HasValue) q = q.Where(ta => ta.TeacherProfileId == teacherId.Value);

        var items = await q.Select(ta => new TeacherAssignmentDto
        {
            Id = ta.Id, TeacherProfileId = ta.TeacherProfileId,
            TeacherName = ta.TeacherProfile.User.FirstName + " " + ta.TeacherProfile.User.LastName,
            SubjectId = ta.SubjectId, SubjectName = ta.Subject.Name,
            ClassSectionId = ta.ClassSectionId, ClassSectionName = ta.ClassSection.Name,
            GradeId = ta.GradeId, GradeName = ta.Grade.Name,
            SemesterId = ta.SemesterId, SemesterName = ta.Semester.Name, IsActive = ta.IsActive
        }).ToListAsync(ct);

        return Result<List<TeacherAssignmentDto>>.Success(items);
    }

    public async Task<Result<TeacherAssignmentDto>> CreateTeacherAssignmentAsync(Guid tenantId, CreateTeacherAssignmentRequest req, CancellationToken ct)
    {
        if (await _db.TeacherAssignments.AnyAsync(ta =>
            ta.TeacherProfileId == req.TeacherProfileId && ta.SubjectId == req.SubjectId &&
            ta.ClassSectionId == req.ClassSectionId && ta.SemesterId == req.SemesterId && ta.IsActive, ct))
            return Result<TeacherAssignmentDto>.Failure("Assignment already exists.");

        var ta = new TeacherAssignment
        {
            TeacherProfileId = req.TeacherProfileId, SubjectId = req.SubjectId,
            ClassSectionId = req.ClassSectionId, GradeId = req.GradeId,
            SemesterId = req.SemesterId, SchoolTenantId = tenantId
        };
        await _db.TeacherAssignments.AddAsync(ta, ct);
        await _db.SaveChangesAsync(ct);

        return Result<TeacherAssignmentDto>.Success(new TeacherAssignmentDto { Id = ta.Id, TeacherProfileId = ta.TeacherProfileId, SubjectId = ta.SubjectId, ClassSectionId = ta.ClassSectionId, GradeId = ta.GradeId, SemesterId = ta.SemesterId, IsActive = true });
    }

    public async Task<Result> RemoveTeacherAssignmentAsync(Guid id, CancellationToken ct)
    {
        var ta = await _db.TeacherAssignments.FindAsync([id], ct);
        if (ta == null) return Result.Failure("Assignment not found.");
        ta.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
