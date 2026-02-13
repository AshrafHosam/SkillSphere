using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Users;

public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; }
}

public class UpdateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UserListDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TeacherDto
{
    public Guid ProfileId { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? EmployeeId { get; set; }
    public string? Specialization { get; set; }
    public bool IsSupervisor { get; set; }
    public bool IsActive { get; set; }
}

public class StudentDto
{
    public Guid ProfileId { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? StudentNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public bool IsActive { get; set; }
}

public class ParentDto
{
    public Guid ProfileId { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Relationship { get; set; }
    public List<StudentDto> Students { get; set; } = [];
}

public class LinkParentRequest
{
    public Guid ParentUserId { get; set; }
    public Guid StudentUserId { get; set; }
    public bool IsPrimary { get; set; } = true;
}

public class CreateTeacherRequest : CreateUserRequest
{
    public string? EmployeeId { get; set; }
    public string? Specialization { get; set; }
}

public class CreateStudentRequest : CreateUserRequest
{
    public string? StudentNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
}
