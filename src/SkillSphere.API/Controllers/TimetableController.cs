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

    // ---- Versions ----
    [HttpGet("versions")]
    public async Task<IActionResult> GetVersions([FromQuery] Guid? groupId, [FromQuery] Guid? semesterId, CancellationToken ct)
        => Ok((await _timetableService.GetVersionsAsync(TenantId, groupId, semesterId, ct)).Data);

    [HttpPost("versions")]
    [Authorize(Roles = "SchoolAdmin,SchoolManager")]
    public async Task<IActionResult> CreateVersion([FromBody] CreateTimetableVersionRequest req, CancellationToken ct)
    {
        var r = await _timetableService.CreateVersionAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    // ---- Entries ----
    [HttpGet("versions/{versionId:guid}/entries")]
    public async Task<IActionResult> GetEntries(Guid versionId, CancellationToken ct)
        => Ok((await _timetableService.GetEntriesAsync(versionId, ct)).Data);

    [HttpPost("entries")]
    [Authorize(Roles = "SchoolAdmin,SchoolManager")]
    public async Task<IActionResult> AddEntry([FromBody] AddTimetableEntryRequest req, CancellationToken ct)
    {
        var r = await _timetableService.AddEntryAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("entries/{id:guid}")]
    [Authorize(Roles = "SchoolAdmin,SchoolManager")]
    public async Task<IActionResult> RemoveEntry(Guid id, CancellationToken ct)
    {
        var r = await _timetableService.RemoveEntryAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    // ---- Validation & Publication ----
    [HttpPost("versions/{id:guid}/validate")]
    [Authorize(Roles = "SchoolAdmin,SchoolManager")]
    public async Task<IActionResult> Validate(Guid id, CancellationToken ct)
        => Ok((await _timetableService.ValidateForPublicationAsync(id, ct)).Data);

    [HttpPost("versions/{id:guid}/publish")]
    [Authorize(Roles = "SchoolAdmin,SchoolManager")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
    {
        var publishedBy = _currentUser.Email ?? "system";
        var r = await _timetableService.PublishAsync(id, publishedBy, ct);
        return r.IsSuccess ? Ok() : BadRequest(new { error = r.Error });
    }

    [HttpPost("versions/{id:guid}/archive")]
    [Authorize(Roles = "SchoolAdmin,SchoolManager")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        var r = await _timetableService.ArchiveAsync(id, ct);
        return r.IsSuccess ? Ok() : BadRequest(new { error = r.Error });
    }

    // ---- Schedules ----
    [HttpGet("teacher/{teacherProfileId:guid}")]
    public async Task<IActionResult> GetTeacherSchedule(Guid teacherProfileId, [FromQuery] Guid semesterId, CancellationToken ct)
        => Ok((await _timetableService.GetTeacherScheduleAsync(teacherProfileId, semesterId, ct)).Data);

    [HttpGet("group/{groupId:guid}")]
    public async Task<IActionResult> GetGroupSchedule(Guid groupId, [FromQuery] Guid semesterId, CancellationToken ct)
        => Ok((await _timetableService.GetGroupScheduleAsync(groupId, semesterId, ct)).Data);
}
