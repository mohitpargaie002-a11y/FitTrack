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