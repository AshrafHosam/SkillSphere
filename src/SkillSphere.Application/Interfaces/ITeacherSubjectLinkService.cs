using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.TeacherSubjectLinks;

namespace SkillSphere.Application.Interfaces;

public interface ITeacherSubjectLinkService
{
    Task<Result<List<TeacherSubjectLinkDto>>> GetLinksAsync(Guid tenantId, Guid? teacherProfileId = null, CancellationToken ct = default);
    Task<Result<TeacherSubjectLinkDto>> CreateAsync(Guid tenantId, CreateTeacherSubjectLinkRequest request, CancellationToken ct = default);
    Task<Result> RemoveAsync(Guid id, CancellationToken ct = default);
}
