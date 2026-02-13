using SkillSphere.Domain.Entities;

namespace SkillSphere.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(ApplicationUser user);
    string GenerateRefreshToken();
    (Guid? userId, bool isValid) ValidateAccessToken(string token, bool validateLifetime = true);
}
