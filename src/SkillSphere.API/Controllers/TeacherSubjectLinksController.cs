using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.TeacherSubjectLinks;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SchoolAdmin,SchoolManager")]
public class TeacherSubjectLinksController : ControllerBase
{
    private readonly ITeacherSubjectLinkService _service;
    private readonly ICurrentUserService _currentUser;

    public TeacherSubjectLinksController(ITeacherSubjectLinkService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpGet]
    public async Task<IActionResult> GetLinks([FromQuery] Guid? teacherProfileId, CancellationToken ct)
        => Ok((await _service.GetLinksAsync(TenantId, teacherProfileId, ct)).Data);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeacherSubjectLinkRequest req, CancellationToken ct)
    {
        var r = await _service.CreateAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remove(Guid id, CancellationToken ct)
    {
        var r = await _service.RemoveAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }
}
