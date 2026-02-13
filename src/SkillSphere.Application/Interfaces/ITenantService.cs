using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Tenants;

namespace SkillSphere.Application.Interfaces;

public interface ITenantService
{
    Task<Result<SchoolTenantDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<List<SchoolTenantDto>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<SchoolTenantDto>> CreateAsync(CreateSchoolTenantRequest request, CancellationToken ct = default);
    Task<Result<SchoolTenantDto>> UpdateAsync(Guid id, UpdateSchoolTenantRequest request, CancellationToken ct = default);
    Task<Result> DeactivateAsync(Guid id, CancellationToken ct = default);
    Task<Result<List<FeatureFlagDto>>> GetFeatureFlagsAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<FeatureFlagDto>> UpdateFeatureFlagAsync(Guid tenantId, UpdateFeatureFlagRequest request, CancellationToken ct = default);
}
