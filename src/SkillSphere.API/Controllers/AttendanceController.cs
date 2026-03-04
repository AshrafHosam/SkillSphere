using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Attendance;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher,TeacherSupervisor,SchoolManager,SchoolAdmin")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    private readonly ICurrentUserService _currentUser;

    public AttendanceController(IAttendanceService attendanceService, ICurrentUserService currentUser)
    {
        _attendanceService = attendanceService;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpPost("submit")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Submit([FromQuery] Guid teacherProfileId,
        [FromBody] SubmitAttendanceRequest req, CancellationToken ct)
    {
        var r = await _attendanceService.SubmitAttendanceAsync(TenantId, teacherProfileId, req, ct);
        return r.IsSuccess ? Ok() : BadRequest(new { error = r.Error });
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime date, [FromQuery] Guid? groupId,
        [FromQuery] Guid? subjectId, CancellationToken ct)
        => Ok((await _attendanceService.GetAttendanceAsync(TenantId, date, groupId, subjectId, ct)).Data);

    [HttpGet("student/{studentProfileId:guid}")]
    public async Task<IActionResult> GetByStudent(Guid studentProfileId, [FromQuery] Guid semesterId, CancellationToken ct)
        => Ok((await _attendanceService.GetStudentAttendanceAsync(studentProfileId, semesterId, ct)).Data);

    [HttpGet("compliance")]
    public async Task<IActionResult> GetCompliance([FromQuery] Guid semesterId, CancellationToken ct)
        => Ok((await _attendanceService.GetComplianceAsync(TenantId, semesterId, ct)).Data);
}
