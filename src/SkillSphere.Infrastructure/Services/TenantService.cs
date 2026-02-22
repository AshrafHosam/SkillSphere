using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Tenants;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Services;

public class TenantService : ITenantService
{
    private readonly SkillSphereDbContext _db;
    private readonly ILogger<TenantService> _logger;

    public TenantService(SkillSphereDbContext db, ILogger<TenantService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<SchoolTenantDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var tenant = await _db.SchoolTenants
            .Include(t => t.FeatureFlags)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

        return tenant == null
            ? Result<SchoolTenantDto>.Failure("School not found.")
            : Result<SchoolTenantDto>.Success(MapToDto(tenant));
    }

    public async Task<Result<List<SchoolTenantDto>>> GetAllAsync(CancellationToken ct = default)
    {
        var tenants = await _db.SchoolTenants
            .Include(t => t.FeatureFlags)
            .OrderBy(t => t.Name)
            .ToListAsync(ct);

        return Result<List<SchoolTenantDto>>.Success(tenants.Select(MapToDto).ToList());
    }

    public async Task<Result<SchoolTenantDto>> CreateAsync(CreateSchoolTenantRequest request, CancellationToken ct = default)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result<SchoolTenantDto>.Failure("School name is required.");
        if (string.IsNullOrWhiteSpace(request.Code))
            return Result<SchoolTenantDto>.Failure("School code is required.");
        if (string.IsNullOrWhiteSpace(request.AdminEmail))
            return Result<SchoolTenantDto>.Failure("Admin email is required.");
        if (string.IsNullOrWhiteSpace(request.AdminPassword))
            return Result<SchoolTenantDto>.Failure("Admin password is required.");
        if (string.IsNullOrWhiteSpace(request.AdminFirstName))
            return Result<SchoolTenantDto>.Failure("Admin first name is required.");
        if (string.IsNullOrWhiteSpace(request.AdminLastName))
            return Result<SchoolTenantDto>.Failure("Admin last name is required.");

        // Check for duplicate school code
        if (await _db.SchoolTenants.AnyAsync(t => t.Code == request.Code, ct))
            return Result<SchoolTenantDto>.Failure("School code already exists.");

        // Check for duplicate admin email
        if (await _db.ApplicationUsers.AnyAsync(u => u.Email == request.AdminEmail, ct))
            return Result<SchoolTenantDto>.Failure($"A user with the email '{request.AdminEmail}' already exists. Please use a different admin email.");

        try
        {
            var tenant = new SchoolTenant
            {
                Name = request.Name,
                Code = request.Code,
                Address = request.Address,
                Phone = request.Phone,
                Email = request.Email
            };

            // Create default feature flags
            foreach (FeatureType ft in Enum.GetValues<FeatureType>())
            {
                tenant.FeatureFlags.Add(new FeatureFlag
                {
                    SchoolTenantId = tenant.Id,
                    FeatureType = ft,
                    IsEnabled = ft is FeatureType.Attendance or FeatureType.InAppNotifications
                });
            }

            await _db.SchoolTenants.AddAsync(tenant, ct);

            // Create School Admin user
            var admin = new ApplicationUser
            {
                Email = request.AdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword),
                FirstName = request.AdminFirstName,
                LastName = request.AdminLastName,
                Role = UserRole.SchoolAdmin,
                SchoolTenantId = tenant.Id
            };

            await _db.ApplicationUsers.AddAsync(admin, ct);
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("School '{SchoolName}' (code: {Code}) created successfully with admin {AdminEmail}",
                request.Name, request.Code, request.AdminEmail);

            return Result<SchoolTenantDto>.Success(MapToDto(tenant));
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error while creating school '{SchoolName}' (code: {Code}, adminEmail: {AdminEmail})",
                request.Name, request.Code, request.AdminEmail);
            return Result<SchoolTenantDto>.Failure($"Failed to create school: {ex.InnerException?.Message ?? ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating school '{SchoolName}' (code: {Code}, adminEmail: {AdminEmail})",
                request.Name, request.Code, request.AdminEmail);
            return Result<SchoolTenantDto>.Failure($"An unexpected error occurred while creating the school: {ex.Message}");
        }
    }

    public async Task<Result<SchoolTenantDto>> UpdateAsync(Guid id, UpdateSchoolTenantRequest request, CancellationToken ct = default)
    {
        var tenant = await _db.SchoolTenants.Include(t => t.FeatureFlags).FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tenant == null) return Result<SchoolTenantDto>.Failure("School not found.");

        tenant.Name = request.Name;
        tenant.Address = request.Address;
        tenant.Phone = request.Phone;
        tenant.Email = request.Email;
        tenant.LogoUrl = request.LogoUrl;

        await _db.SaveChangesAsync(ct);
        return Result<SchoolTenantDto>.Success(MapToDto(tenant));
    }

    public async Task<Result> DeactivateAsync(Guid id, CancellationToken ct = default)
    {
        var tenant = await _db.SchoolTenants.FindAsync([id], ct);
        if (tenant == null) return Result.Failure("School not found.");

        tenant.IsActive = false;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> ReactivateAsync(Guid id, CancellationToken ct = default)
    {
        var tenant = await _db.SchoolTenants.FindAsync([id], ct);
        if (tenant == null) return Result.Failure("School not found.");

        tenant.IsActive = true;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<List<FeatureFlagDto>>> GetFeatureFlagsAsync(Guid tenantId, CancellationToken ct = default)
    {
        var flags = await _db.FeatureFlags
            .Where(f => f.SchoolTenantId == tenantId)
            .OrderBy(f => f.FeatureType)
            .ToListAsync(ct);

        return Result<List<FeatureFlagDto>>.Success(flags.Select(f => new FeatureFlagDto
        {
            Id = f.Id,
            FeatureType = f.FeatureType,
            IsEnabled = f.IsEnabled,
            Configuration = f.Configuration
        }).ToList());
    }

    public async Task<Result<FeatureFlagDto>> UpdateFeatureFlagAsync(Guid tenantId, UpdateFeatureFlagRequest request, CancellationToken ct = default)
    {
        var flag = await _db.FeatureFlags
            .FirstOrDefaultAsync(f => f.SchoolTenantId == tenantId && f.FeatureType == request.FeatureType, ct);

        if (flag == null)
        {
            flag = new FeatureFlag
            {
                SchoolTenantId = tenantId,
                FeatureType = request.FeatureType,
                IsEnabled = request.IsEnabled,
                Configuration = request.Configuration
            };
            await _db.FeatureFlags.AddAsync(flag, ct);
        }
        else
        {
            flag.IsEnabled = request.IsEnabled;
            flag.Configuration = request.Configuration;
        }

        await _db.SaveChangesAsync(ct);
        return Result<FeatureFlagDto>.Success(new FeatureFlagDto
        {
            Id = flag.Id,
            FeatureType = flag.FeatureType,
            IsEnabled = flag.IsEnabled,
            Configuration = flag.Configuration
        });
    }

    private static SchoolTenantDto MapToDto(SchoolTenant t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Code = t.Code,
        Address = t.Address,
        Phone = t.Phone,
        Email = t.Email,
        LogoUrl = t.LogoUrl,
        IsActive = t.IsActive,
        FeatureFlags = t.FeatureFlags.Select(f => new FeatureFlagDto
        {
            Id = f.Id,
            FeatureType = f.FeatureType,
            IsEnabled = f.IsEnabled,
            Configuration = f.Configuration
        }).ToList()
    };
}
