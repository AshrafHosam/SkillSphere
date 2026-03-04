using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.DTOs.Academic;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SchoolAdmin,SchoolManager")]
public class AcademicController : ControllerBase
{
    private readonly IAcademicService _academicService;
    private readonly ICurrentUserService _currentUser;

    public AcademicController(IAcademicService academicService, ICurrentUserService currentUser)
    {
        _academicService = academicService;
        _currentUser = currentUser;
    }

    private Guid TenantId => _currentUser.SchoolTenantId ?? throw new UnauthorizedAccessException("Tenant context required.");

    // ---- Grades ----
    [HttpGet("grades")]
    public async Task<IActionResult> GetGrades(CancellationToken ct) => Ok((await _academicService.GetGradesAsync(TenantId, ct)).Data);

    [HttpPost("grades")]
    public async Task<IActionResult> CreateGrade([FromBody] CreateGradeRequest req, CancellationToken ct)
    {
        var r = await _academicService.CreateGradeAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPut("grades/{id:guid}")]
    public async Task<IActionResult> UpdateGrade(Guid id, [FromBody] CreateGradeRequest req, CancellationToken ct)
    {
        var r = await _academicService.UpdateGradeAsync(id, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("grades/{id:guid}")]
    public async Task<IActionResult> DeleteGrade(Guid id, CancellationToken ct)
    {
        var r = await _academicService.DeleteGradeAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    // ---- Groups (was Class Sections) ----
    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups([FromQuery] Guid? gradeId, CancellationToken ct) => Ok((await _academicService.GetGroupsAsync(TenantId, gradeId, ct)).Data);

    [HttpPost("groups")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest req, CancellationToken ct)
    {
        var r = await _academicService.CreateGroupAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPut("groups/{id:guid}")]
    public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] CreateGroupRequest req, CancellationToken ct)
    {
        var r = await _academicService.UpdateGroupAsync(id, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("groups/{id:guid}")]
    public async Task<IActionResult> DeleteGroup(Guid id, CancellationToken ct)
    {
        var r = await _academicService.DeleteGroupAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    // ---- Subjects ----
    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects(CancellationToken ct) => Ok((await _academicService.GetSubjectsAsync(TenantId, ct)).Data);

    [HttpPost("subjects")]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectRequest req, CancellationToken ct)
    {
        var r = await _academicService.CreateSubjectAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPut("subjects/{id:guid}")]
    public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] CreateSubjectRequest req, CancellationToken ct)
    {
        var r = await _academicService.UpdateSubjectAsync(id, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("subjects/{id:guid}")]
    public async Task<IActionResult> DeleteSubject(Guid id, CancellationToken ct)
    {
        var r = await _academicService.DeleteSubjectAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    // ---- Departments ----
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments(CancellationToken ct) => Ok((await _academicService.GetDepartmentsAsync(TenantId, ct)).Data);

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest req, CancellationToken ct)
    {
        var r = await _academicService.CreateDepartmentAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPut("departments/{id:guid}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] CreateDepartmentRequest req, CancellationToken ct)
    {
        var r = await _academicService.UpdateDepartmentAsync(id, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("departments/{id:guid}")]
    public async Task<IActionResult> DeleteDepartment(Guid id, CancellationToken ct)
    {
        var r = await _academicService.DeleteDepartmentAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }

    // ---- Semesters ----
    [HttpGet("semesters")]
    public async Task<IActionResult> GetSemesters(CancellationToken ct) => Ok((await _academicService.GetSemestersAsync(TenantId, ct)).Data);

    [HttpPost("semesters")]
    public async Task<IActionResult> CreateSemester([FromBody] CreateSemesterRequest req, CancellationToken ct)
    {
        var r = await _academicService.CreateSemesterAsync(TenantId, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpPut("semesters/{id:guid}")]
    public async Task<IActionResult> UpdateSemester(Guid id, [FromBody] CreateSemesterRequest req, CancellationToken ct)
    {
        var r = await _academicService.UpdateSemesterAsync(id, req, ct);
        return r.IsSuccess ? Ok(r.Data) : BadRequest(new { error = r.Error });
    }

    [HttpDelete("semesters/{id:guid}")]
    public async Task<IActionResult> DeleteSemester(Guid id, CancellationToken ct)
    {
        var r = await _academicService.DeleteSemesterAsync(id, ct);
        return r.IsSuccess ? NoContent() : BadRequest(new { error = r.Error });
    }
}
