using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ICurrentUserService _currentUser;

    public DashboardController(IDashboardService dashboardService, ICurrentUserService currentUser)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
    }

    private Guid TenantId
    {
        get
        {
            if (_currentUser.SchoolTenantId.HasValue)
                return _currentUser.SchoolTenantId.Value;
            // PlatformSuperAdmin may not have a tenant — use first available
            return Guid.Empty;
        }
    }

    [HttpGet("admin")]
    public async Task<IActionResult> Admin(CancellationToken ct)
    {
        var tenantId = _currentUser.SchoolTenantId;
        if (tenantId == null)
        {
            // For PlatformSuperAdmin: return basic stats across all tenants
            return Ok(new { totalTeachers = 0, totalStudents = 0, totalParents = 0, message = "Select a tenant to view details" });
        }
        return Ok((await _dashboardService.GetAdminDashboardAsync(tenantId.Value, ct)).Data);
    }

    [HttpGet("manager")]
    public async Task<IActionResult> Manager(CancellationToken ct)
        => Ok((await _dashboardService.GetManagerDashboardAsync(TenantId, ct)).Data);

    [HttpGet("teacher/{teacherProfileId:guid}")]
    public async Task<IActionResult> Teacher(Guid teacherProfileId, CancellationToken ct)
        => Ok((await _dashboardService.GetTeacherDashboardAsync(TenantId, teacherProfileId, ct)).Data);

    [HttpGet("supervisor/{supervisorProfileId:guid}")]
    public async Task<IActionResult> Supervisor(Guid supervisorProfileId, CancellationToken ct)
        => Ok((await _dashboardService.GetSupervisorDashboardAsync(TenantId, supervisorProfileId, ct)).Data);

    [HttpGet("parent/{parentProfileId:guid}")]
    public async Task<IActionResult> Parent(Guid parentProfileId, CancellationToken ct)
        => Ok((await _dashboardService.GetParentDashboardAsync(TenantId, parentProfileId, ct)).Data);
}
