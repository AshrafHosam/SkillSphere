using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Assignments;

namespace SkillSphere.Application.Interfaces;

public interface IAssignmentService
{
    Task<Result<List<StudentAssignmentDto>>> GetStudentAssignmentsAsync(Guid tenantId, Guid? semesterId = null, Guid? gradeId = null, Guid? groupId = null, CancellationToken ct = default);
    Task<Result<StudentAssignmentDto>> CreateStudentAssignmentAsync(Guid tenantId, CreateStudentAssignmentRequest request, CancellationToken ct = default);
    Task<Result<List<StudentAssignmentDto>>> BulkAssignStudentsAsync(Guid tenantId, BulkAssignStudentsRequest request, CancellationToken ct = default);
    Task<Result> RemoveStudentAssignmentAsync(Guid id, CancellationToken ct = default);
}
