using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Reports;

namespace SkillSphere.Application.Interfaces;

public interface IInternalReportService
{
    Task<Result<PagedResult<InternalReportDto>>> GetReportsAsync(Guid tenantId, Guid? supervisorId = null, Guid? reporterId = null, PaginationParams? pagination = null, CancellationToken ct = default);
    Task<Result<InternalReportDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<InternalReportDto>> CreateAsync(Guid tenantId, Guid teacherProfileId, CreateInternalReportRequest request, CancellationToken ct = default);
    Task<Result> AddCommentAsync(Guid reportId, Guid userId, AddInternalReportCommentRequest request, CancellationToken ct = default);
    Task<Result> EscalateAsync(Guid reportId, EscalateInternalReportRequest request, CancellationToken ct = default);
    Task<Result> ResolveAsync(Guid reportId, CancellationToken ct = default);
}
