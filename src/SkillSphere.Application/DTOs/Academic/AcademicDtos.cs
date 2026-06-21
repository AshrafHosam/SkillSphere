using System.ComponentModel.DataAnnotations;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Academic;

public class GradeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsActive { get; set; }
    public int GroupCount { get; set; }
}

public class CreateGradeRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [Range(1, 100)]
    public int OrderIndex { get; set; }
}

public class GroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public string GradeNameAr { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
    public int StudentCount { get; set; }
}

public class CreateGroupRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [Required]
    public Guid GradeId { get; set; }
    [Range(1, 500)]
    public int Capacity { get; set; }
}

public class SubjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? Code { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public RoomType? RequiredRoomType { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSubjectRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? Code { get; set; }
    public Guid? DepartmentId { get; set; }
    public RoomType? RequiredRoomType { get; set; }
}

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int SubjectCount { get; set; }
}

public class CreateDepartmentRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? Description { get; set; }
}

public class SemesterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSemesterRequest : IValidatableObject
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [Required]
    public DateTime StartDate { get; set; }
    [Required]
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EndDate <= StartDate)
            yield return new ValidationResult("End date must be after start date.", [nameof(EndDate)]);
    }
}
