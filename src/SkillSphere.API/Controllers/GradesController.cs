using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Grades;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GradesController : ControllerBase
{
    private readonly IGradeRecordService _gradeService;
    private readonly ICurrentUserService _currentUser;

    public GradesController(IGradeRecordService gradeService, ICurrentUserService currentUser)
    {
        _gradeService = gradeService;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    // Grade Records
    [HttpGet("records")]
    public async Task<IActionResult> GetRecords([FromQuery] Guid? studentId, [FromQuery] Guid? subjectId,
        [FromQuery] Guid? semesterId, CancellationToken ct)
        => Ok((await _gradeService.GetGradeRecordsAsync(TenantId, studentId, subjectId, semesterId, ct)).Data);

    [HttpPost("records")]
    public async Task<IActionResult> CreateRecord([FromQuery] Guid teacherProfileId,
        [FromBody] CreateGradeRecordRequest req, CancellationToken ct)
    {
        var r = await _gradeService.CreateGradeRecordAsync(TenantId, teacherProfileId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("records/{id:guid}")]
    public async Task<IActionResult> DeleteRecord(Guid id, CancellationToken ct)
    {
        var r = await _gradeService.DeleteGradeRecordAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    // Behavior Feedback
    [HttpGet("behavior")]
    public async Task<IActionResult> GetBehavior([FromQuery] Guid? studentId, [FromQuery] Guid? semesterId, CancellationToken ct)
        => Ok((await _gradeService.GetBehaviorFeedbackAsync(TenantId, studentId, semesterId, ct)).Data);

    [HttpPost("behavior")]
    public async Task<IActionResult> CreateBehavior([FromQuery] Guid teacherProfileId,
        [FromBody] CreateBehaviorFeedbackRequest req, CancellationToken ct)
    {
        var r = await _gradeService.CreateBehaviorFeedbackAsync(TenantId, teacherProfileId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }
}

