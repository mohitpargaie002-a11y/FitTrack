using FitTrack.API.Data;
using FitTrack.API.DTOs;
using FitTrack.API.Models.Entities;
using FitTrack.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.API.Services;

public class WorkoutPlanService(AppDbContext db) : IWorkoutPlanService
{
    public async Task<WorkoutPlanDto> CreatePlanAsync(Guid userId, CreatePlanRequest request)
    {
        var plan = new WorkoutPlan
        {
            UserId = userId,
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        db.WorkoutPlans.Add(plan);
        await db.SaveChangesAsync();
        return MapToDto(plan);
    }

    public async Task<WorkoutPlanDto?> GetPlanAsync(Guid userId, Guid planId)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

        return plan is null ? null : MapToDto(plan);
    }

    public async Task<List<WorkoutPlanDto>> GetAllPlansAsync(Guid userId)
    {
        var plans = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .Where(p => p.UserId == userId)
            .ToListAsync();

        return plans.Select(MapToDto).ToList();
    }

    // Seeds a full 6-month plan with all exercises pre-loaded
    public async Task SeedDefaultPlanAsync(Guid userId, DateOnly startDate)
    {
        var endDate = startDate.AddDays(181);

        var plan = new WorkoutPlan
        {
            UserId = userId,
            Name = "6-Month Home Workout",
            StartDate = startDate,
            EndDate = endDate
        };

        db.WorkoutPlans.Add(plan);
        await db.SaveChangesAsync();

        // cycle: 0=chest, 1=back, 2=abs, 3=rest, repeat
        var totalDays = (endDate.DayNumber - startDate.DayNumber) + 1;
        var workoutDayCount = 0;

        for (int i = 0; i < totalDays; i++)
        {
            var cyclePos = i % 4;
            DayType dayType;

            if (cyclePos == 3)
            {
                dayType = DayType.Rest;
            }
            else
            {
                dayType = (workoutDayCount % 3) switch
                {
                    0 => DayType.Chest,
                    1 => DayType.Back,
                    _ => DayType.Abs
                };
                workoutDayCount++;
            }

            var planDay = new PlanDay
            {
                WorkoutPlanId = plan.Id,
                DayIndex = i,
                DayType = dayType
            };

            db.PlanDays.Add(planDay);
            await db.SaveChangesAsync();

            // Add exercises based on day type
            var exercises = GetDefaultExercises(dayType, planDay.Id);
            db.ExerciseTemplates.AddRange(exercises);
        }

        await db.SaveChangesAsync();
    }

    private static List<ExerciseTemplate> GetDefaultExercises(DayType dayType, Guid planDayId)
    {
        return dayType switch
        {
            DayType.Chest => [
                new() { PlanDayId = planDayId, Name = "Standard Push-Up", Description = "Keep body straight, elbows at 45°", Sets = 3, Reps = "10-15", OrderIndex = 1 },
                new() { PlanDayId = planDayId, Name = "Wide-Grip Push-Up", Description = "Hands wider than shoulder-width", Sets = 3, Reps = "10-12", OrderIndex = 2 },
                new() { PlanDayId = planDayId, Name = "Pike Push-Up", Description = "Hips raised, head toward floor", Sets = 3, Reps = "8-12", OrderIndex = 3 },
                new() { PlanDayId = planDayId, Name = "Diamond Push-Up", Description = "Diamond shape with hands under chest", Sets = 3, Reps = "8-10", OrderIndex = 4 },
                new() { PlanDayId = planDayId, Name = "Shoulder Tap Plank", Description = "Alternate tapping each shoulder", Sets = 3, Reps = "20 taps", OrderIndex = 5 },
            ],
            DayType.Back => [
                new() { PlanDayId = planDayId, Name = "Superman Hold", Description = "Hold 2 sec at top", Sets = 3, Reps = "12", OrderIndex = 1 },
                new() { PlanDayId = planDayId, Name = "Reverse Snow Angels", Description = "Arms off floor the whole time", Sets = 3, Reps = "12-15", OrderIndex = 2 },
                new() { PlanDayId = planDayId, Name = "Push-Up to T-Rotation", Description = "Rotate into side plank after each push-up", Sets = 3, Reps = "8 each side", OrderIndex = 3 },
                new() { PlanDayId = planDayId, Name = "Prone Y-W-T Raises", Description = "Raise arms in Y, W, and T shapes", Sets = 2, Reps = "10 each shape", OrderIndex = 4 },
                new() { PlanDayId = planDayId, Name = "Plank Hold", Description = "Keep back flat, squeeze glutes", Sets = 3, Reps = "30-45 sec", OrderIndex = 5 },
            ],
            DayType.Abs => [
                new() { PlanDayId = planDayId, Name = "Crunches", Description = "Controlled movement, don't pull neck", Sets = 3, Reps = "15-20", OrderIndex = 1 },
                new() { PlanDayId = planDayId, Name = "Leg Raises", Description = "Keep lower back pressed to floor", Sets = 3, Reps = "12-15", OrderIndex = 2 },
                new() { PlanDayId = planDayId, Name = "Bicycle Crunches", Description = "Slow and controlled", Sets = 3, Reps = "20 total", OrderIndex = 3 },
                new() { PlanDayId = planDayId, Name = "Plank", Description = "Full body tight", Sets = 3, Reps = "30-45 sec", OrderIndex = 4 },
                new() { PlanDayId = planDayId, Name = "Mountain Climbers", Description = "Drive knees toward chest alternately", Sets = 3, Reps = "30 sec", OrderIndex = 5 },
            ],
            _ => []
        };
    }

    private static WorkoutPlanDto MapToDto(WorkoutPlan plan) => new(
        plan.Id,
        plan.Name,
        plan.StartDate,
        plan.EndDate,
        plan.PlanDays
            .OrderBy(d => d.DayIndex)
            .Select(d => new PlanDayDto(
                d.Id,
                d.DayIndex,
                d.DayType,
                d.ExerciseTemplates
                    .OrderBy(e => e.OrderIndex)
                    .Select(e => new ExerciseTemplateDto(
                        e.Id, e.Name, e.Description, e.Sets, e.Reps, e.OrderIndex))
                    .ToList()
            ))
            .ToList()
    );
}