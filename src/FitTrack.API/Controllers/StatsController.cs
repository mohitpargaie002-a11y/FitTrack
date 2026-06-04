using FitTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.API.Controllers;

[Authorize]
[Route("api/plans/{planId}/stats")]
public class StatsController(IStatsService statsService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetDashboard(Guid planId)
    {
        try
        {
            var result = await statsService.GetDashboardStatsAsync(CurrentUserId, planId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}