using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Academic;

namespace SkillSphere.Application.Interfaces;

public interface IAcademicService
{
    // Grades
    Task<Result<List<GradeDto>>> GetGradesAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<GradeDto>> CreateGradeAsync(Guid tenantId, CreateGradeRequest request, CancellationToken ct = default);
    Task<Result<GradeDto>> UpdateGradeAsync(Guid id, CreateGradeRequest request, CancellationToken ct = default);
    Task<Result> DeleteGradeAsync(Guid id, CancellationToken ct = default);

    // Groups (was ClassSections)
    Task<Result<List<GroupDto>>> GetGroupsAsync(Guid tenantId, Guid? gradeId = null, CancellationToken ct = default);
    Task<Result<GroupDto>> CreateGroupAsync(Guid tenantId, CreateGroupRequest request, CancellationToken ct = default);
    Task<Result<GroupDto>> UpdateGroupAsync(Guid id, CreateGroupRequest request, CancellationToken ct = default);
    Task<Result> DeleteGroupAsync(Guid id, CancellationToken ct = default);

    // Subjects
    Task<Result<List<SubjectDto>>> GetSubjectsAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<SubjectDto>> CreateSubjectAsync(Guid tenantId, CreateSubjectRequest request, CancellationToken ct = default);
    Task<Result<SubjectDto>> UpdateSubjectAsync(Guid id, CreateSubjectRequest request, CancellationToken ct = default);
    Task<Result> DeleteSubjectAsync(Guid id, CancellationToken ct = default);

    // Departments
    Task<Result<List<DepartmentDto>>> GetDepartmentsAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<DepartmentDto>> CreateDepartmentAsync(Guid tenantId, CreateDepartmentRequest request, CancellationToken ct = default);
    Task<Result<DepartmentDto>> UpdateDepartmentAsync(Guid id, CreateDepartmentRequest request, CancellationToken ct = default);
    Task<Result> DeleteDepartmentAsync(Guid id, CancellationToken ct = default);

    // Semesters
    Task<Result<List<SemesterDto>>> GetSemestersAsync(Guid tenantId, CancellationToken ct = default);
    Task<Result<SemesterDto>> CreateSemesterAsync(Guid tenantId, CreateSemesterRequest request, CancellationToken ct = default);
    Task<Result<SemesterDto>> UpdateSemesterAsync(Guid id, CreateSemesterRequest request, CancellationToken ct = default);
    Task<Result> DeleteSemesterAsync(Guid id, CancellationToken ct = default);
}
