using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Curriculum;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SchoolAdmin,SchoolManager")]
public class CurriculumController : ControllerBase
{
    private readonly ICurriculumService _service;
    private readonly ICurrentUserService _currentUser;

    public CurriculumController(ICurriculumService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    [HttpGet]
    public async Task<IActionResult> GetContracts([FromQuery] Guid? gradeId, [FromQuery] Guid? semesterId, CancellationToken ct)
        => Ok((await _service.GetContractsAsync(TenantId, gradeId, semesterId, ct)).Data);

    [HttpPost]
    public async Task<IActionResult> SetContract([FromBody] SetCurriculumContractRequest req, CancellationToken ct)
    {
        var r = await _service.SetContractAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveContract(Guid id, CancellationToken ct)
    {
        var r = await _service.RemoveContractAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }
}
