using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Assignments;

namespace SkillSphere.Application.Interfaces;

public interface IAssignmentService
{
    Task<Result<List<StudentAssignmentDto>>> GetStudentAssignmentsAsync(Guid tenantId, Guid? semesterId = null, Guid? gradeId = null, Guid? classId = null, CancellationToken ct = default);
    Task<Result<StudentAssignmentDto>> CreateStudentAssignmentAsync(Guid tenantId, CreateStudentAssignmentRequest request, CancellationToken ct = default);
    Task<Result> RemoveStudentAssignmentAsync(Guid id, CancellationToken ct = default);

    Task<Result<List<TeacherAssignmentDto>>> GetTeacherAssignmentsAsync(Guid tenantId, Guid? semesterId = null, Guid? teacherId = null, CancellationToken ct = default);
    Task<Result<TeacherAssignmentDto>> CreateTeacherAssignmentAsync(Guid tenantId, CreateTeacherAssignmentRequest request, CancellationToken ct = default);
    Task<Result> RemoveTeacherAssignmentAsync(Guid id, CancellationToken ct = default);
}
