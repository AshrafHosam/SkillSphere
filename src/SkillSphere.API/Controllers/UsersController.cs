using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Users;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Enums;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICurrentUserService _currentUser;

    public UsersController(IUserService userService, ICurrentUserService currentUser)
    {
        _userService = userService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] UserRole? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.GetUsersAsync(_currentUser.SchoolTenantId.Value, role, new PaginationParams { Page = page, PageSize = pageSize }, ct);
        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _userService.GetByIdAsync(id, ct);
        return result.IsSuccess ? Ok(result.Data) : NotFound(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken ct)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.CreateUserAsync(_currentUser.SchoolTenantId.Value, request, ct);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        var result = await _userService.UpdateUserAsync(id, request, ct);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        var result = await _userService.DeactivateUserAsync(id, ct);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        var result = await _userService.ActivateUserAsync(id, ct);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpPost("teachers")]
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherRequest request, CancellationToken ct)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.CreateTeacherAsync(_currentUser.SchoolTenantId.Value, request, ct);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(new { error = result.Error });
    }

    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeachers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.GetTeachersAsync(_currentUser.SchoolTenantId.Value, new PaginationParams { Page = page, PageSize = pageSize }, ct);
        return Ok(result.Data);
    }

    [HttpPost("students")]
    public async Task<IActionResult> CreateStudent([FromBody] CreateStudentRequest request, CancellationToken ct)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.CreateStudentAsync(_currentUser.SchoolTenantId.Value, request, ct);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(new { error = result.Error });
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetStudents([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.GetStudentsAsync(_currentUser.SchoolTenantId.Value, new PaginationParams { Page = page, PageSize = pageSize }, ct);
        return Ok(result.Data);
    }

    [HttpGet("parents")]
    public async Task<IActionResult> GetParents([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.GetParentsAsync(_currentUser.SchoolTenantId.Value, new PaginationParams { Page = page, PageSize = pageSize }, ct);
        return Ok(result.Data);
    }

    [HttpPost("parent-link")]
    public async Task<IActionResult> LinkParent([FromBody] LinkParentRequest request, CancellationToken ct)
    {
        if (_currentUser.SchoolTenantId == null) return Forbid();
        var result = await _userService.LinkParentToStudentAsync(_currentUser.SchoolTenantId.Value, request, ct);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }
}
