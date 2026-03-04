using Microsoft.EntityFrameworkCore;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.PeriodDefinitions;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class PeriodDefinitionService : IPeriodDefinitionService
{
    private readonly SkillSphereDbContext _db;
    public PeriodDefinitionService(SkillSphereDbContext db) => _db = db;

    public async Task<Result<List<PeriodDefinitionDto>>> GetPeriodsAsync(Guid tenantId, CancellationToken ct)
    {
        var items = await _db.PeriodDefinitions
            .Where(p => p.SchoolTenantId == tenantId)
            .OrderBy(p => p.PeriodNumber)
            .Select(p => new PeriodDefinitionDto
            {
                Id = p.Id, PeriodNumber = p.PeriodNumber, Label = p.Label,
                StartTime = p.StartTime, EndTime = p.EndTime, IsBreak = p.IsBreak, IsActive = p.IsActive
            }).ToListAsync(ct);
        return Result<List<PeriodDefinitionDto>>.Success(items);
    }

    public async Task<Result<PeriodDefinitionDto>> CreateAsync(Guid tenantId, CreatePeriodDefinitionRequest req, CancellationToken ct)
    {
        if (req.EndTime <= req.StartTime)
            return Result<PeriodDefinitionDto>.Failure("EndTime must be greater than StartTime.");

        // Check for overlapping periods
        var overlapping = await _db.PeriodDefinitions.AnyAsync(p =>
            p.SchoolTenantId == tenantId && p.StartTime < req.EndTime && p.EndTime > req.StartTime, ct);
        if (overlapping)
            return Result<PeriodDefinitionDto>.Failure("Period times overlap with an existing period.");

        var period = new PeriodDefinition
        {
            PeriodNumber = req.PeriodNumber, Label = req.Label,
            StartTime = req.StartTime, EndTime = req.EndTime,
            IsBreak = req.IsBreak, SchoolTenantId = tenantId
        };
        await _db.PeriodDefinitions.AddAsync(period, ct);
        await _db.SaveChangesAsync(ct);

        return Result<PeriodDefinitionDto>.Success(new PeriodDefinitionDto
        {
            Id = period.Id, PeriodNumber = period.PeriodNumber, Label = period.Label,
            StartTime = period.StartTime, EndTime = period.EndTime, IsBreak = period.IsBreak, IsActive = true
        });
    }

    public async Task<Result<PeriodDefinitionDto>> UpdateAsync(Guid id, CreatePeriodDefinitionRequest req, CancellationToken ct)
    {
        var period = await _db.PeriodDefinitions.FindAsync([id], ct);
        if (period == null) return Result<PeriodDefinitionDto>.Failure("Period definition not found.");

        if (req.EndTime <= req.StartTime)
            return Result<PeriodDefinitionDto>.Failure("EndTime must be greater than StartTime.");

        var overlapping = await _db.PeriodDefinitions.AnyAsync(p =>
            p.SchoolTenantId == period.SchoolTenantId && p.Id != id &&
            p.StartTime < req.EndTime && p.EndTime > req.StartTime, ct);
        if (overlapping)
            return Result<PeriodDefinitionDto>.Failure("Period times overlap with an existing period.");

        period.PeriodNumber = req.PeriodNumber;
        period.Label = req.Label;
        period.StartTime = req.StartTime;
        period.EndTime = req.EndTime;
        period.IsBreak = req.IsBreak;
        await _db.SaveChangesAsync(ct);

        return Result<PeriodDefinitionDto>.Success(new PeriodDefinitionDto
        {
            Id = period.Id, PeriodNumber = period.PeriodNumber, Label = period.Label,
            StartTime = period.StartTime, EndTime = period.EndTime, IsBreak = period.IsBreak, IsActive = period.IsActive
        });
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var period = await _db.PeriodDefinitions.FindAsync([id], ct);
        if (period == null) return Result.Failure("Period definition not found.");
        period.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
