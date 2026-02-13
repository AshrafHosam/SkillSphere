using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Grades;

namespace SkillSphere.Application.Interfaces;

public interface IGradeRecordService
{
    Task<Result<List<GradeRecordDto>>> GetGradeRecordsAsync(Guid tenantId, Guid? studentId = null, Guid? subjectId = null, Guid? semesterId = null, CancellationToken ct = default);
    Task<Result<GradeRecordDto>> CreateGradeRecordAsync(Guid tenantId, Guid teacherProfileId, CreateGradeRecordRequest request, CancellationToken ct = default);
    Task<Result> DeleteGradeRecordAsync(Guid id, CancellationToken ct = default);

    Task<Result<List<BehaviorFeedbackDto>>> GetBehaviorFeedbackAsync(Guid tenantId, Guid? studentId = null, Guid? semesterId = null, CancellationToken ct = default);
    Task<Result<BehaviorFeedbackDto>> CreateBehaviorFeedbackAsync(Guid tenantId, Guid teacherProfileId, CreateBehaviorFeedbackRequest request, CancellationToken ct = default);
}
