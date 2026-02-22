using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Users;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.Interfaces;

public interface IUserService
{
    Task<Result<UserListDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<PagedResult<UserListDto>>> GetUsersAsync(Guid? tenantId, UserRole? role, PaginationParams pagination, CancellationToken ct = default);
    Task<Result<UserListDto>> CreateUserAsync(Guid tenantId, CreateUserRequest request, CancellationToken ct = default);
    Task<Result<UserListDto>> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default);
    Task<Result> DeactivateUserAsync(Guid id, CancellationToken ct = default);
    Task<Result> ActivateUserAsync(Guid id, CancellationToken ct = default);
    Task<Result<TeacherDto>> CreateTeacherAsync(Guid tenantId, CreateTeacherRequest request, CancellationToken ct = default);
    Task<Result<StudentDto>> CreateStudentAsync(Guid tenantId, CreateStudentRequest request, CancellationToken ct = default);
    Task<Result<PagedResult<TeacherDto>>> GetTeachersAsync(Guid tenantId, PaginationParams pagination, CancellationToken ct = default);
    Task<Result<PagedResult<StudentDto>>> GetStudentsAsync(Guid tenantId, PaginationParams pagination, CancellationToken ct = default);
    Task<Result<PagedResult<ParentDto>>> GetParentsAsync(Guid tenantId, PaginationParams pagination, CancellationToken ct = default);
    Task<Result> LinkParentToStudentAsync(Guid tenantId, LinkParentRequest request, CancellationToken ct = default);
}
