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
}