namespace FitTrack.API.DTOs;

public record LogEntryDto(
    Guid Id,
    Guid ExerciseTemplateId,
    string ExerciseName,
    string Reps,
    int Sets,
    bool IsCompleted,
    string? Notes
);

public record DailyLogDto(
    Guid Id,
    DateOnly Date,
    Guid PlanDayId,
    string DayType,
    bool IsCompleted,
    DateTime? CompletedAt,
    string? Notes,
    List<LogEntryDto> LogEntries
);

public record CalendarDayDto(
    DateOnly Date,
    string DayType,
    bool HasLog,
    bool IsCompleted,
    int TotalExercises,
    int CompletedExercises
);

public record ToggleExerciseRequest(bool IsCompleted);
public record ToggleDayRequest(bool IsCompleted);
public record UpdateNotesRequest(string? Notes);