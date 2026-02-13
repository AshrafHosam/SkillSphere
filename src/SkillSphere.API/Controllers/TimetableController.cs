using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Timetable;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TimetableController : ControllerBase
{
    private readonly ITimetableService _timetableService;
    private readonly ICurrentUserService _currentUser;

    public TimetableController(ITimetableService timetableService, ICurrentUserService currentUser)
    {
        _timetableService = timetableService;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpGet("versions")]
    public async Task<IActionResult> GetVersions([FromQuery] Guid? semesterId, CancellationToken ct)
        => Ok((await _timetableService.GetVersionsAsync(TenantId, semesterId, ct)).Data);

    [HttpPost("versions")]
    public async Task<IActionResult> CreateVersion([FromBody] CreateTimetableVersionRequest req, CancellationToken ct)
    {
        var r = await _timetableService.CreateVersionAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPost("versions/{id:guid}/publish")]
    public async Task<IActionResult> PublishVersion(Guid id, CancellationToken ct)
    {
        var r = await _timetableService.PublishVersionAsync(id, ct);
        return r.IsSuccess ? Ok() : BadRequest(new { error = r.Error });
    }

    [HttpGet("versions/{versionId:guid}/entries")]
    public async Task<IActionResult> GetEntries(Guid versionId, CancellationToken ct)
        => Ok((await _timetableService.GetEntriesAsync(versionId, ct)).Data);

    [HttpGet("teacher/{teacherProfileId:guid}")]
    public async Task<IActionResult> GetTeacherTimetable(Guid teacherProfileId, [FromQuery] Guid semesterId, CancellationToken ct)
        => Ok((await _timetableService.GetTeacherTimetableAsync(teacherProfileId, semesterId, ct)).Data);

    [HttpPost("entries")]
    public async Task<IActionResult> CreateEntry([FromBody] CreateTimetableEntryRequest req, CancellationToken ct)
    {
        var r = await _timetableService.CreateEntryAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPost("entries/validate")]
    public async Task<IActionResult> ValidateEntry([FromBody] CreateTimetableEntryRequest req, CancellationToken ct)
        => Ok((await _timetableService.ValidateEntryAsync(TenantId, req, ct)).Data);

    [HttpDelete("entries/{id:guid}")]
    public async Task<IActionResult> DeleteEntry(Guid id, CancellationToken ct)
    {
        var r = await _timetableService.DeleteEntryAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }
}
