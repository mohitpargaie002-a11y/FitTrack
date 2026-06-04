using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.API.Controllers;

[ApiController]
public class BaseController : ControllerBase
{
    protected Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}