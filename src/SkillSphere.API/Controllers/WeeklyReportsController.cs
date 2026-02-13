using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Reports;
using SkillSphere.Application.Common;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/weekly-reports")]
[Authorize]
public class WeeklyReportsController : ControllerBase
{
    private readonly IWeeklyReportService _reportService;
    private readonly ICurrentUserService _currentUser;

    public WeeklyReportsController(IWeeklyReportService reportService, ICurrentUserService currentUser)
    {
        _reportService = reportService;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? semesterId, [FromQuery] Guid? teacherId,
        [FromQuery] Guid? studentId, [FromQuery] int? weekNumber,
        [FromQuery] PaginationParams paging, CancellationToken ct)
        => Ok((await _reportService.GetReportsAsync(TenantId, semesterId, teacherId, studentId, weekNumber, paging, ct)).Data);

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var r = await _reportService.GetByIdAsync(id, ct);
        return r.IsSuccess ? Ok(r.Data) : NotFound(new { error = r.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromQuery] Guid teacherProfileId,
        [FromBody] CreateWeeklyReportRequest req, CancellationToken ct)
    {
        var r = await _reportService.CreateAsync(TenantId, teacherProfileId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
    {
        var r = await _reportService.SubmitAsync(id, ct);
        return r.IsSuccess ? Ok() : BadRequest(new { error = r.Error });
    }

    [HttpGet("compliance")]
    public async Task<IActionResult> Compliance([FromQuery] Guid semesterId, [FromQuery] int weekNumber, CancellationToken ct)
        => Ok((await _reportService.GetComplianceAsync(TenantId, semesterId, weekNumber, ct)).Data);

    [HttpGet("parent/{parentProfileId:guid}")]
    public async Task<IActionResult> ParentReports(Guid parentProfileId, [FromQuery] Guid studentProfileId, CancellationToken ct)
        => Ok((await _reportService.GetParentReportsAsync(parentProfileId, studentProfileId, ct)).Data);
}

