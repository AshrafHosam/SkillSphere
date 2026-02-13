using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Tenants;

public class SchoolTenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; }
    public List<FeatureFlagDto> FeatureFlags { get; set; } = [];
}

public class CreateSchoolTenantRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminFirstName { get; set; } = string.Empty;
    public string AdminLastName { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
}

public class UpdateSchoolTenantRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
}

public class FeatureFlagDto
{
    public Guid Id { get; set; }
    public FeatureType FeatureType { get; set; }
    public bool IsEnabled { get; set; }
    public string? Configuration { get; set; }
}

public class UpdateFeatureFlagRequest
{
    public FeatureType FeatureType { get; set; }
    public bool IsEnabled { get; set; }
    public string? Configuration { get; set; }
}
