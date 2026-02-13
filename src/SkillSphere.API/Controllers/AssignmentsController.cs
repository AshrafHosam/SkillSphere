using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Assignments;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly ICurrentUserService _currentUser;

    public AssignmentsController(IAssignmentService assignmentService, ICurrentUserService currentUser)
    {
        _assignmentService = assignmentService;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpGet("students")]
    public async Task<IActionResult> GetStudentAssignments([FromQuery] Guid? semesterId, [FromQuery] Guid? gradeId, [FromQuery] Guid? classId, CancellationToken ct)
        => Ok((await _assignmentService.GetStudentAssignmentsAsync(TenantId, semesterId, gradeId, classId, ct)).Data);

    [HttpPost("students")]
    public async Task<IActionResult> CreateStudentAssignment([FromBody] CreateStudentAssignmentRequest req, CancellationToken ct)
    {
        var r = await _assignmentService.CreateStudentAssignmentAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("students/{id:guid}")]
    public async Task<IActionResult> RemoveStudentAssignment(Guid id, CancellationToken ct)
    {
        var r = await _assignmentService.RemoveStudentAssignmentAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeacherAssignments([FromQuery] Guid? semesterId, [FromQuery] Guid? teacherId, CancellationToken ct)
        => Ok((await _assignmentService.GetTeacherAssignmentsAsync(TenantId, semesterId, teacherId, ct)).Data);

    [HttpPost("teachers")]
    public async Task<IActionResult> CreateTeacherAssignment([FromBody] CreateTeacherAssignmentRequest req, CancellationToken ct)
    {
        var r = await _assignmentService.CreateTeacherAssignmentAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("teachers/{id:guid}")]
    public async Task<IActionResult> RemoveTeacherAssignment(Guid id, CancellationToken ct)
    {
        var r = await _assignmentService.RemoveTeacherAssignmentAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }
}
