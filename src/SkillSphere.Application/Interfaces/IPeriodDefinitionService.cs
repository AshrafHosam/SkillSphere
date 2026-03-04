using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.PeriodDefinitions;

namespace SkillSphere.Application.Interfaces;

public interface IPeriodDefinitionService
{
    Task<Result<List<PeriodDefinitionDto>>> GetPeriodsAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<PeriodDefinitionDto>> CreateAsync(Guid tenantId, CreatePeriodDefinitionRequest request, CancellationToken ct = default);
    Task<Result<PeriodDefinitionDto>> UpdateAsync(Guid id, CreatePeriodDefinitionRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
