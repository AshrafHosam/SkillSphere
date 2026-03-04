using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Rooms;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Enums;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SchoolAdmin,SchoolManager")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _service;
    private readonly ICurrentUserService _currentUser;

    public RoomsController(IRoomService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] RoomType? type, CancellationToken ct)
        => Ok((await _service.GetRoomsAsync(TenantId, type, ct)).Data);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoomRequest req, CancellationToken ct)
    {
        var r = await _service.CreateAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoomRequest req, CancellationToken ct)
    {
        var r = await _service.UpdateAsync(id, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var r = await _service.DeleteAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }
}
