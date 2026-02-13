using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Dashboard;

namespace SkillSphere.Application.Interfaces;

public interface IDashboardService
{
    Task<Result<AdminDashboardDto>> GetAdminDashboardAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<ManagerDashboardDto>> GetManagerDashboardAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<TeacherDashboardDto>> GetTeacherDashboardAsync(Guid tenantId, Guid teacherProfileId, CancellationToken ct = default);
    Task<Result<SupervisorDashboardDto>> GetSupervisorDashboardAsync(Guid tenantId, Guid teacherProfileId, CancellationToken ct = default);
    Task<Result<ParentDashboardDto>> GetParentDashboardAsync(Guid tenantId, Guid parentProfileId, CancellationToken ct = default);
}
