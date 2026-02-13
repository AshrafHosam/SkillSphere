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

    // Class Sections
    Task<Result<List<ClassSectionDto>>> GetClassSectionsAsync(Guid tenantId, Guid? gradeId = null, CancellationToken ct = default);
    Task<Result<ClassSectionDto>> CreateClassSectionAsync(Guid tenantId, CreateClassSectionRequest request, CancellationToken ct = default);
    Task<Result<ClassSectionDto>> UpdateClassSectionAsync(Guid id, CreateClassSectionRequest request, CancellationToken ct = default);
    Task<Result> DeleteClassSectionAsync(Guid id, CancellationToken ct = default);

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
