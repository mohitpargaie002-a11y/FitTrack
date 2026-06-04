using FitTrack.API.DTOs;

namespace FitTrack.API.Services.Interfaces;

public interface IDailyLogService
{
    Task<List<CalendarDayDto>> GetCalendarAsync(Guid userId, Guid planId, int year, int month);
    Task<DailyLogDto> GetOrCreateLogAsync(Guid userId, Guid planId, DateOnly date);
    Task<DailyLogDto> ToggleExerciseAsync(Guid userId, Guid logId, Guid entryId, bool isCompleted);
    Task<DailyLogDto> ToggleDayAsync(Guid userId, Guid logId, bool isCompleted);
}