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

    public async Task<Result<List<StudentAssignmentDto>>> BulkAssignStudentsAsync(Guid tenantId, BulkAssignStudentsRequest req, CancellationToken ct)
    {
        if (req.StudentProfileIds.Count == 0)
            return Result<List<StudentAssignmentDto>>.Failure("No students specified.");

        // Validate group belongs to the specified grade
        var group = await _db.Groups.FirstOrDefaultAsync(g => g.Id == req.GroupId && g.GradeId == req.GradeId && g.SchoolTenantId == tenantId, ct);
        if (group == null)
            return Result<List<StudentAssignmentDto>>.Failure("Group not found or does not belong to the specified grade.");

        // Validate semester exists
        var semester = await _db.Semesters.FirstOrDefaultAsync(s => s.Id == req.SemesterId && s.SchoolTenantId == tenantId, ct);
        if (semester == null)
            return Result<List<StudentAssignmentDto>>.Failure("Semester not found.");

        // Check which students already have an active assignment for this semester
        var alreadyAssigned = await _db.StudentAssignments
            .Where(sa => sa.SchoolTenantId == tenantId
                && sa.SemesterId == req.SemesterId
                && sa.IsActive
                && req.StudentProfileIds.Contains(sa.StudentProfileId))
            .Select(sa => new { sa.StudentProfileId, sa.Group.Name })
            .ToListAsync(ct);

        if (alreadyAssigned.Count > 0)
        {
            var names = string.Join(", ", alreadyAssigned.Select(a => a.Name).Distinct());
            return Result<List<StudentAssignmentDto>>.Failure(
                $"{alreadyAssigned.Count} student(s) already assigned to a group ({names}) for this semester. Remove existing assignments first.");
        }

        // Validate all student profiles exist in this tenant
        var validStudentIds = await _db.StudentProfiles
            .Where(sp => sp.SchoolTenantId == tenantId && req.StudentProfileIds.Contains(sp.Id))
            .Select(sp => sp.Id)
            .ToListAsync(ct);

        var invalidIds = req.StudentProfileIds.Except(validStudentIds).ToList();
        if (invalidIds.Count > 0)
            return Result<List<StudentAssignmentDto>>.Failure($"{invalidIds.Count} student profile(s) not found in this school.");

        var grade = await _db.Grades.FirstOrDefaultAsync(g => g.Id == req.GradeId && g.SchoolTenantId == tenantId, ct);

        var created = new List<StudentAssignment>();
        foreach (var studentId in req.StudentProfileIds)
        {
            var sa = new StudentAssignment
            {
                StudentProfileId = studentId,
                GradeId = req.GradeId,
                GroupId = req.GroupId,
                SemesterId = req.SemesterId,
                SchoolTenantId = tenantId
            };
            _db.StudentAssignments.Add(sa);
            created.Add(sa);
        }

        await _db.SaveChangesAsync(ct);

        // Build DTOs with names
        var studentNames = await _db.StudentProfiles
            .Include(sp => sp.User)
            .Where(sp => req.StudentProfileIds.Contains(sp.Id))
            .ToDictionaryAsync(sp => sp.Id, sp => $"{sp.User.FirstName} {sp.User.LastName}", ct);

        var dtos = created.Select(sa => new StudentAssignmentDto
        {
            Id = sa.Id,
            StudentProfileId = sa.StudentProfileId,
            StudentName = studentNames.GetValueOrDefault(sa.StudentProfileId, ""),
            GradeId = sa.GradeId,
            GradeName = grade?.Name ?? "",
            GroupId = sa.GroupId,
            GroupName = group.Name,
            SemesterId = sa.SemesterId,
            SemesterName = semester.Name,
            IsActive = true
        }).ToList();

        return Result<List<StudentAssignmentDto>>.Success(dtos);
    }
}
