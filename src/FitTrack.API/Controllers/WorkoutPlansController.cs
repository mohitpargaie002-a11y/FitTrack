using FitTrack.API.DTOs;
using FitTrack.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitTrack.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class WorkoutPlansController(IWorkoutPlanService workoutPlanService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var plans = await workoutPlanService.GetAllPlansAsync(CurrentUserId);
        return Ok(plans);
    }

    [HttpGet("{planId}")]
    public async Task<IActionResult> Get(Guid planId)
    {
        var plan = await workoutPlanService.GetPlanAsync(CurrentUserId, planId);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePlanRequest request)
    {
        var plan = await workoutPlanService.CreatePlanAsync(CurrentUserId, request);
        return CreatedAtAction(nameof(Get), new { planId = plan.Id }, plan);
    }

    [HttpPost("seed")]
    public async Task<IActionResult> SeedDefault([FromQuery] DateOnly startDate)
    {
        await workoutPlanService.SeedDefaultPlanAsync(CurrentUserId, startDate);
        var plans = await workoutPlanService.GetAllPlansAsync(CurrentUserId);
        return Ok(plans.Last());
    }
    [HttpGet("v2")]
    public async Task<IActionResult> GetAllV2()
    {
        var plans = await workoutPlanService.GetAllPlansV2Async(CurrentUserId);
        return Ok(plans);
    }

    [HttpGet("v2/{planId}")]
    public async Task<IActionResult> GetV2(Guid planId)
    {
        var plan = await workoutPlanService.GetPlanV2Async(CurrentUserId, planId);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpPost("v2")]
    public async Task<IActionResult> CreateV2(CreatePlanV2Request request)
    {
        try
        {
            var plan = await workoutPlanService.CreatePlanV2Async(CurrentUserId, request);
            return CreatedAtAction(nameof(GetV2), new { planId = plan.Id }, plan);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("{planId}")]
    public async Task<IActionResult> Delete(Guid planId)
    {
        try
        {
            await workoutPlanService.DeletePlanAsync(CurrentUserId, planId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("v2/{planId}/days/{dayType}/exercises")]
    public async Task<IActionResult> UpdateDayExercises(
    Guid planId, string dayType, UpdateDayExercisesRequest request)
    {
        try
        {
            var result = await workoutPlanService.UpdateDayExercisesAsync(
                CurrentUserId, planId, dayType, request.Exercises);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}