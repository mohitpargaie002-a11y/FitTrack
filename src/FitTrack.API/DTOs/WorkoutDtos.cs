using FitTrack.API.Models.Entities;

namespace FitTrack.API.DTOs;

public record CreatePlanRequest(string Name, DateOnly StartDate, DateOnly EndDate);

public record PlanDayDto(
    Guid Id,
    int DayIndex,
    DayType DayType,
    List<ExerciseTemplateDto> Exercises
);

public record ExerciseTemplateDto(
    Guid Id,
    string Name,
    string? Description,
    int Sets,
    string Reps,
    int OrderIndex
);

public record WorkoutPlanDto(
    Guid Id,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    List<PlanDayDto> PlanDays
);

public record AddExerciseRequest(
    string Name,
    string? Description,
    int Sets,
    string Reps,
    int OrderIndex
);

public record ExerciseInputDto(
    string Name,
    string? Description,
    int Sets,
    string Reps
);

public record DaySlotInputDto(
    string SlotName,        // e.g. "Chest", "Back", "Abs", or custom
    List<ExerciseInputDto> Exercises
);

public record CreatePlanV2Request(
    string Name,
    DateOnly StartDate,
    int DurationMonths,     // 1, 3, 6, or 0 for custom
    DateOnly? CustomEndDate,// used when DurationMonths = 0
    int WorkDays,           // e.g. 3
    int RestDays,           // e.g. 1
    List<DaySlotInputDto> DaySlots  // one per work day in the cycle
);

public record CycleConfigDto(
    int WorkDays,
    int RestDays,
    List<string> Slots
);

// Update existing WorkoutPlanDto to include CycleConfig
public record WorkoutPlanV2Dto(
    Guid Id,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    CycleConfigDto CycleConfig,
    List<PlanDayDto> PlanDays
);

public record UpdateDayExercisesRequest(List<ExerciseInputDto> Exercises);