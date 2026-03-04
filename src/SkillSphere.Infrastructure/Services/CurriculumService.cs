using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Curriculum;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class CurriculumService : ICurriculumService
{
    private readonly SkillSphereDbContext _db;
    public CurriculumService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<List<CurriculumContractDto>>> GetContractsAsync(Guid tenantId, Guid? gradeId, Guid? semesterId, CancellationToken ct)
    {
        var query = _db.CurriculumContracts
            .Include(c => c.Grade).Include(c => c.Semester).Include(c => c.Subject)
            .Where(c => c.SchoolTenantId == tenantId);

        if (gradeId.HasValue) query = query.Where(c => c.GradeId == gradeId.Value);
        if (semesterId.HasValue) query = query.Where(c => c.SemesterId == semesterId.Value);

        var items = await query
            .OrderBy(c => c.Subject.Name)
            .Select(c => new CurriculumContractDto
            {
                Id = c.Id, GradeId = c.GradeId, GradeName = c.Grade.Name,
                SemesterId = c.SemesterId, SemesterName = c.Semester.Name,
                SubjectId = c.SubjectId, SubjectName = c.Subject.Name,
                PeriodsPerWeek = c.PeriodsPerWeek
            }).ToListAsync(ct);
        return Result<List<CurriculumContractDto>>.Success(items);
    }

    public async Task<Result<CurriculumContractDto>> SetContractAsync(Guid tenantId, SetCurriculumContractRequest req, CancellationToken ct)
    {
        if (req.PeriodsPerWeek <= 0)
            return Result<CurriculumContractDto>.Failure("PeriodsPerWeek must be greater than 0.");

        // Upsert: find existing or create new
        var existing = await _db.CurriculumContracts.FirstOrDefaultAsync(c =>
            c.SchoolTenantId == tenantId && c.GradeId == req.GradeId &&
            c.SemesterId == req.SemesterId && c.SubjectId == req.SubjectId, ct);

        if (existing != null)
        {
            existing.PeriodsPerWeek = req.PeriodsPerWeek;
        }
        else
        {
            existing = new CurriculumContract
            {
                GradeId = req.GradeId, SemesterId = req.SemesterId,
                SubjectId = req.SubjectId, PeriodsPerWeek = req.PeriodsPerWeek,
                SchoolTenantId = tenantId
            };
            await _db.CurriculumContracts.AddAsync(existing, ct);
        }
        await _db.SaveChangesAsync(ct);

        // Re-load with navigation
        var grade = await _db.Grades.FindAsync([req.GradeId], ct);
        var semester = await _db.Semesters.FindAsync([req.SemesterId], ct);
        var subject = await _db.Subjects.FindAsync([req.SubjectId], ct);

        return Result<CurriculumContractDto>.Success(new CurriculumContractDto
        {
            Id = existing.Id, GradeId = existing.GradeId, GradeName = grade?.Name ?? "",
            SemesterId = existing.SemesterId, SemesterName = semester?.Name ?? "",
            SubjectId = existing.SubjectId, SubjectName = subject?.Name ?? "",
            PeriodsPerWeek = existing.PeriodsPerWeek
        });
    }

    public async Task<Result> RemoveContractAsync(Guid id, CancellationToken ct)
    {
        var contract = await _db.CurriculumContracts.FindAsync([id], ct);
        if (contract == null) return Result.Failure("Curriculum contract not found.");
        contract.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
