namespace FitTrack.API.DTOs;

public record WeeklyBarDto(
    string WeekLabel,      // e.g. "Jun W1"
    int Completed,
    int Total
);

public record ExerciseStatsDto(
    string ExerciseName,
    string DayType,
    int TimesCompleted,
    int TimesScheduled,
    int CompletionRate    // 0-100
);

public record DashboardStatsDto(
    int CurrentStreak,
    int LongestStreak,
    int TotalCompleted,
    int TotalScheduled,
    int OverallConsistency,       // 0-100
    int ChestConsistency,
    int BackConsistency,
    int AbsConsistency,
    int DaysRemaining,
    List<WeeklyBarDto> WeeklyBars,
    List<ExerciseStatsDto> ExerciseStats,
    List<CalendarDayDto> HeatmapDays   // reuse existing DTO
);