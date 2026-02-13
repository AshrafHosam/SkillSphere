using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSphere.Application.Interfaces;
using SkillSphere.Domain.Interfaces;

namespace SkillSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    // Placeholder — notification delivery (email, SMS, push) handled by background services.
    [HttpGet]
    public IActionResult Get() => Ok(new { message = "Notification endpoints coming in Phase 2." });
}
