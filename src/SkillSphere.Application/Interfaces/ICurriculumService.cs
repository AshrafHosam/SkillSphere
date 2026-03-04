using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Curriculum;

namespace SkillSphere.Application.Interfaces;

public interface ICurriculumService
{
    Task<Result<List<CurriculumContractDto>>> GetContractsAsync(Guid tenantId, Guid? gradeId, Guid? semesterId, CancellationToken ct = default);
    Task<Result<CurriculumContractDto>> SetContractAsync(Guid tenantId, SetCurriculumContractRequest request, CancellationToken ct = default);
    Task<Result> RemoveContractAsync(Guid id, CancellationToken ct = default);
}
