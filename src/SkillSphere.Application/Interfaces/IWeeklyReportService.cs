using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Reports;

namespace SkillSphere.Application.Interfaces;

public interface IWeeklyReportService
{
    Task<Result<PagedResult<WeeklyReportDto>>> GetReportsAsync(Guid tenantId, Guid? semesterId = null, Guid? teacherId = null, Guid? studentId = null, int? weekNumber = null, PaginationParams? pagination = null, CancellationToken ct = default);
    Task<Result<WeeklyReportDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<WeeklyReportDto>> CreateAsync(Guid tenantId, Guid teacherProfileId, CreateWeeklyReportRequest request, CancellationToken ct = default);
    Task<Result> SubmitAsync(Guid id, CancellationToken ct = default);
    Task<Result<List<WeeklyReportComplianceDto>>> GetComplianceAsync(Guid tenantId, Guid semesterId, int weekNumber, CancellationToken ct = default);
    Task<Result<List<WeeklyReportDto>>> GetParentReportsAsync(Guid parentProfileId, Guid studentProfileId, CancellationToken ct = default);
}
