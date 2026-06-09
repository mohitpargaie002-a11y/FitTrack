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

    public async Task<WorkoutPlanV2Dto> CreatePlanV2Async(Guid userId, CreatePlanV2Request request)
    {
        // Validate only one plan at a time
        var existing = await db.WorkoutPlans.AnyAsync(p => p.UserId == userId);
        if (existing)
            throw new InvalidOperationException(
                "You already have an active plan. Delete it before creating a new one.");

        // Validate slots match work days
        if (request.DaySlots.Count != request.WorkDays)
            throw new ArgumentException(
                $"Expected {request.WorkDays} day slots but got {request.DaySlots.Count}.");

        // Calculate end date
        var endDate = request.DurationMonths > 0
            ? request.StartDate.AddMonths(request.DurationMonths).AddDays(-1)
            : request.CustomEndDate
                ?? throw new ArgumentException("CustomEndDate required when DurationMonths is 0.");

        var cycleConfig = new CycleConfig
        {
            WorkDays = request.WorkDays,
            RestDays = request.RestDays,
            Slots = request.DaySlots.Select(s => s.SlotName).ToList()
        };

        var plan = new WorkoutPlan
        {
            UserId = userId,
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = endDate
        };
        plan.SetCycleConfig(cycleConfig);

        db.WorkoutPlans.Add(plan);
        await db.SaveChangesAsync();

        // Generate plan days
        var cycleLength = request.WorkDays + request.RestDays;
        var totalDays = (endDate.DayNumber - request.StartDate.DayNumber) + 1;

        for (int i = 0; i < totalDays; i++)
        {
            var posInCycle = i % cycleLength;
            var isRest = posInCycle >= request.WorkDays;

            DayType dayType;
            DaySlotInputDto? slot = null;

            if (isRest)
            {
                dayType = DayType.Rest;
            }
            else
            {
                slot = request.DaySlots[posInCycle];
                dayType = slot.SlotName.ToLower() switch
                {
                    "chest" => DayType.Chest,
                    "back" => DayType.Back,
                    "abs" => DayType.Abs,
                    _ => DayType.Chest  // custom slots map to Chest for now
                };
            }

            var planDay = new PlanDay
            {
                WorkoutPlanId = plan.Id,
                DayIndex = i,
                DayType = dayType
            };

            db.PlanDays.Add(planDay);
            await db.SaveChangesAsync();

            if (slot != null)
            {
                var exercises = slot.Exercises.Select((ex, idx) => new ExerciseTemplate
                {
                    PlanDayId = planDay.Id,
                    Name = ex.Name,
                    Description = ex.Description,
                    Sets = ex.Sets,
                    Reps = ex.Reps,
                    OrderIndex = idx + 1
                }).ToList();

                db.ExerciseTemplates.AddRange(exercises);
            }
        }

        await db.SaveChangesAsync();
        return (await GetPlanV2Async(userId, plan.Id))!;
    }

    public async Task<WorkoutPlanV2Dto?> GetPlanV2Async(Guid userId, Guid planId)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

        return plan is null ? null : MapToV2Dto(plan);
    }

    public async Task<List<WorkoutPlanV2Dto>> GetAllPlansV2Async(Guid userId)
    {
        var plans = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .Where(p => p.UserId == userId)
            .ToListAsync();

        return plans.Select(MapToV2Dto).ToList();
    }

    private static WorkoutPlanV2Dto MapToV2Dto(WorkoutPlan plan)
    {
        var config = plan.GetCycleConfig();
        return new WorkoutPlanV2Dto(
            plan.Id,
            plan.Name,
            plan.StartDate,
            plan.EndDate,
            new CycleConfigDto(config.WorkDays, config.RestDays, config.Slots),
            plan.PlanDays
                .OrderBy(d => d.DayIndex)
                .Select(d => new PlanDayDto(
                    d.Id,
                    d.DayIndex,
                    d.DayType,
                    d.ExerciseTemplates
                        .OrderBy(e => e.OrderIndex)
                        .Select(e => new ExerciseTemplateDto(
                            e.Id, e.Name, e.Description,
                            e.Sets, e.Reps, e.OrderIndex))
                        .ToList()
                ))
                .ToList()
        );
    }
    public async Task DeletePlanAsync(Guid userId, Guid planId)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Plan not found.");

        // Delete in correct order to respect foreign key constraints
        // 1. Get all daily log IDs for this plan's days
        var planDayIds = plan.PlanDays.Select(d => d.Id).ToList();

        var dailyLogs = await db.DailyLogs
            .Include(l => l.LogEntries)
            .Where(l => planDayIds.Contains(l.PlanDayId))
            .ToListAsync();

        // 2. Delete log entries first
        var logEntries = dailyLogs.SelectMany(l => l.LogEntries).ToList();
        db.LogEntries.RemoveRange(logEntries);

        // 3. Delete daily logs
        db.DailyLogs.RemoveRange(dailyLogs);

        // 4. Delete exercise templates
        var exerciseTemplates = await db.ExerciseTemplates
            .Where(e => planDayIds.Contains(e.PlanDayId))
            .ToListAsync();
        db.ExerciseTemplates.RemoveRange(exerciseTemplates);

        // 5. Delete plan days
        db.PlanDays.RemoveRange(plan.PlanDays);

        // 6. Delete the plan itself
        db.WorkoutPlans.Remove(plan);

        await db.SaveChangesAsync();
    }

    public async Task<WorkoutPlanV2Dto> UpdateDayExercisesAsync(
    Guid userId, Guid planId, string dayType, List<ExerciseInputDto> exercises)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Plan not found.");

        // Parse the day type
        if (!Enum.TryParse<DayType>(dayType, ignoreCase: true, out var parsedDayType))
            throw new ArgumentException($"Invalid day type: {dayType}");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Get all plan days of this type
        var targetDays = plan.PlanDays
            .Where(d => d.DayType == parsedDayType)
            .ToList();

        if (targetDays.Count == 0)
            throw new KeyNotFoundException($"No days of type '{dayType}' found in this plan.");

        // Split into past and future days
        var futureDays = targetDays
            .Where(d => plan.StartDate.AddDays(d.DayIndex) > today)
            .ToList();

        var loggedDayIds = await db.DailyLogs
            .Where(l => l.UserId == userId &&
                        targetDays.Select(d => d.Id).Contains(l.PlanDayId))
            .Select(l => l.PlanDayId)
            .Distinct()
            .ToListAsync();

        // Only update days that haven't been logged yet (future + unlogged past)
        var daysToUpdate = targetDays
            .Where(d => !loggedDayIds.Contains(d.Id))
            .ToList();

        foreach (var day in daysToUpdate)
        {
            // Remove existing exercises on unlogged days
            db.ExerciseTemplates.RemoveRange(day.ExerciseTemplates);

            // Add new exercises
            var newExercises = exercises.Select((ex, idx) => new ExerciseTemplate
            {
                PlanDayId = day.Id,
                Name = ex.Name,
                Description = ex.Description,
                Sets = ex.Sets,
                Reps = ex.Reps,
                OrderIndex = idx + 1
            }).ToList();

            db.ExerciseTemplates.AddRange(newExercises);
        }

        await db.SaveChangesAsync();
        return (await GetPlanV2Async(userId, planId))!;
    }
}