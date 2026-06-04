using FitTrack.API.Data;
using FitTrack.API.DTOs;
using FitTrack.API.Models.Entities;
using FitTrack.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.API.Services;

public class DailyLogService(AppDbContext db) : IDailyLogService
{
    public async Task<List<CalendarDayDto>> GetCalendarAsync(
        Guid userId, Guid planId, int year, int month)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Plan not found.");

        var firstDay = new DateOnly(year, month, 1);
        var lastDay = firstDay.AddMonths(1).AddDays(-1);

        // clamp to plan range
        var from = firstDay < plan.StartDate ? plan.StartDate : firstDay;
        var to = lastDay > plan.EndDate ? plan.EndDate : lastDay;

        var logs = await db.DailyLogs
            .Include(l => l.LogEntries)
            .Where(l => l.UserId == userId && l.Date >= from && l.Date <= to)
            .ToListAsync();

        var result = new List<CalendarDayDto>();
        var current = from;

        while (current <= to)
        {
            var diff = current.DayNumber - plan.StartDate.DayNumber;
            var planDay = plan.PlanDays.FirstOrDefault(d => d.DayIndex == diff);
            var log = logs.FirstOrDefault(l => l.Date == current);

            var totalEx = planDay?.ExerciseTemplates.Count ?? 0;
            var completedEx = log?.LogEntries.Count(e => e.IsCompleted) ?? 0;

            result.Add(new CalendarDayDto(
                current,
                planDay?.DayType.ToString() ?? "Rest",
                log != null,
                log?.IsCompleted ?? false,
                totalEx,
                completedEx
            ));

            current = current.AddDays(1);
        }

        return result;
    }

    public async Task<DailyLogDto> GetOrCreateLogAsync(
        Guid userId, Guid planId, DateOnly date)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Plan not found.");

        var diff = date.DayNumber - plan.StartDate.DayNumber;
        var planDay = plan.PlanDays.FirstOrDefault(d => d.DayIndex == diff)
            ?? throw new KeyNotFoundException("No plan day for this date.");

        var log = await db.DailyLogs
            .Include(l => l.LogEntries)
                .ThenInclude(e => e.ExerciseTemplate)
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Date == date);

        if (log is null)
        {
            log = new DailyLog
            {
                UserId = userId,
                PlanDayId = planDay.Id,
                Date = date
            };
            db.DailyLogs.Add(log);

            // auto-create a log entry for each exercise
            foreach (var ex in planDay.ExerciseTemplates)
            {
                log.LogEntries.Add(new LogEntry
                {
                    ExerciseTemplateId = ex.Id,
                    IsCompleted = false
                });
            }

            await db.SaveChangesAsync();

            // reload with includes
            log = await db.DailyLogs
                .Include(l => l.LogEntries)
                    .ThenInclude(e => e.ExerciseTemplate)
                .FirstAsync(l => l.Id == log.Id);
        }

        return MapToDto(log, planDay.DayType.ToString());
    }

    public async Task<DailyLogDto> ToggleExerciseAsync(
        Guid userId, Guid logId, Guid entryId, bool isCompleted)
    {
        var log = await db.DailyLogs
            .Include(l => l.LogEntries)
                .ThenInclude(e => e.ExerciseTemplate)
            .FirstOrDefaultAsync(l => l.Id == logId && l.UserId == userId)
            ?? throw new KeyNotFoundException("Log not found.");

        var entry = log.LogEntries.FirstOrDefault(e => e.Id == entryId)
            ?? throw new KeyNotFoundException("Entry not found.");

        entry.IsCompleted = isCompleted;

        // auto-complete the day if all exercises are done
        if (log.LogEntries.All(e => e.IsCompleted))
        {
            log.IsCompleted = true;
            log.CompletedAt = DateTime.UtcNow;
        }
        else
        {
            log.IsCompleted = false;
            log.CompletedAt = null;
        }

        await db.SaveChangesAsync();

        var planDay = await db.PlanDays.FindAsync(log.PlanDayId);
        return MapToDto(log, planDay?.DayType.ToString() ?? "Rest");
    }

    public async Task<DailyLogDto> ToggleDayAsync(
        Guid userId, Guid logId, bool isCompleted)
    {
        var log = await db.DailyLogs
            .Include(l => l.LogEntries)
                .ThenInclude(e => e.ExerciseTemplate)
            .FirstOrDefaultAsync(l => l.Id == logId && l.UserId == userId)
            ?? throw new KeyNotFoundException("Log not found.");

        log.IsCompleted = isCompleted;
        log.CompletedAt = isCompleted ? DateTime.UtcNow : null;

        // mark all exercises to match
        foreach (var entry in log.LogEntries)
            entry.IsCompleted = isCompleted;

        await db.SaveChangesAsync();

        var planDay = await db.PlanDays.FindAsync(log.PlanDayId);
        return MapToDto(log, planDay?.DayType.ToString() ?? "Rest");
    }

    private static DailyLogDto MapToDto(DailyLog log, string dayType) => new(
        log.Id,
        log.Date,
        log.PlanDayId,
        dayType,
        log.IsCompleted,
        log.CompletedAt,
        log.Notes,
        log.LogEntries
            .OrderBy(e => e.ExerciseTemplate.OrderIndex)
            .Select(e => new LogEntryDto(
                e.Id,
                e.ExerciseTemplateId,
                e.ExerciseTemplate.Name,
                e.ExerciseTemplate.Reps,
                e.ExerciseTemplate.Sets,
                e.IsCompleted,
                e.Notes
            ))
            .ToList()
    );
}