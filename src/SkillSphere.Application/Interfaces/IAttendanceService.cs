using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Attendance;

namespace SkillSphere.Application.Interfaces;

public interface IAttendanceService
{
    Task<Result<List<AttendanceRecordDto>>> GetAttendanceAsync(Guid tenantId, DateTime date, Guid? groupId = null, Guid? subjectId = null, CancellationToken ct = default);
    Task<Result> SubmitAttendanceAsync(Guid tenantId, Guid callerUserId, SubmitAttendanceRequest request, CancellationToken ct = default);
    Task<Result> UpdateAttendanceAsync(Guid tenantId, Guid callerUserId, string callerRole, UpdateAttendanceEntryRequest request, CancellationToken ct = default);
    Task<Result<List<AttendanceRecordDto>>> GetStudentAttendanceAsync(Guid studentProfileId, Guid semesterId, CancellationToken ct = default);
    Task<Result<List<AttendanceComplianceDto>>> GetComplianceAsync(Guid tenantId, Guid semesterId, CancellationToken ct = default);
    Task<Result<List<SessionComplianceDto>>> GetSessionComplianceAsync(Guid tenantId, Guid semesterId, DateTime? date = null, Guid? teacherProfileId = null, CancellationToken ct = default);
    Task<Result<AttendanceEditPermissionDto>> GrantEditPermissionAsync(Guid tenantId, Guid adminUserId, string adminName, GrantEditPermissionRequest request, CancellationToken ct = default);
    Task<Result> RevokeEditPermissionAsync(Guid permissionId, Guid adminUserId, CancellationToken ct = default);
    Task<Result<List<AttendanceEditPermissionDto>>> GetEditPermissionsAsync(Guid tenantId, Guid? teacherProfileId = null, CancellationToken ct = default);
}
