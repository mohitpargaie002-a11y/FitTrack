using FitTrack.API.DTOs;
using FitTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.API.Controllers;

[Authorize]
[Route("api/plans/{planId}/logs")]
public class DailyLogsController(IDailyLogService logService) : BaseController
{
    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendar(
        Guid planId, [FromQuery] int year, [FromQuery] int month)
    {
        try
        {
            var result = await logService.GetCalendarAsync(CurrentUserId, planId, year, month);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetByDate(Guid planId, DateOnly date)
    {
        try
        {
            var result = await logService.GetOrCreateLogAsync(CurrentUserId, planId, date);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{logId}/toggle")]
    public async Task<IActionResult> ToggleDay(
        Guid planId, Guid logId, ToggleDayRequest request)
    {
        try
        {
            var result = await logService.ToggleDayAsync(CurrentUserId, logId, request.IsCompleted);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{logId}/entries/{entryId}/toggle")]
    public async Task<IActionResult> ToggleExercise(
        Guid planId, Guid logId, Guid entryId, ToggleExerciseRequest request)
    {
        try
        {
            var result = await logService.ToggleExerciseAsync(
                CurrentUserId, logId, entryId, request.IsCompleted);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}