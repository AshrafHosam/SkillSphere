using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Attendance;

namespace SkillSphere.Application.Interfaces;

public interface IAttendanceService
{
    Task<Result<List<AttendanceRecordDto>>> GetAttendanceAsync(Guid tenantId, DateTime date, Guid? classId = null, Guid? subjectId = null, CancellationToken ct = default);
    Task<Result> SubmitAttendanceAsync(Guid tenantId, Guid teacherProfileId, SubmitAttendanceRequest request, CancellationToken ct = default);
    Task<Result<List<AttendanceRecordDto>>> GetStudentAttendanceAsync(Guid studentProfileId, Guid semesterId, CancellationToken ct = default);
    Task<Result<List<AttendanceComplianceDto>>> GetComplianceAsync(Guid tenantId, Guid semesterId, CancellationToken ct = default);
}
