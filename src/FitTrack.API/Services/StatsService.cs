using FitTrack.API.Data;
using FitTrack.API.DTOs;
using FitTrack.API.Models.Entities;
using FitTrack.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.API.Services;

public class StatsService(AppDbContext db) : IStatsService
{
    public async Task<DashboardStatsDto> GetDashboardStatsAsync(Guid userId, Guid planId)
    {
        var plan = await db.WorkoutPlans
            .Include(p => p.PlanDays)
                .ThenInclude(d => d.ExerciseTemplates)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Plan not found.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var logs = await db.DailyLogs
            .Include(l => l.LogEntries)
                .ThenInclude(e => e.ExerciseTemplate)
            .Where(l => l.UserId == userId && l.Date <= today)
            .OrderBy(l => l.Date)
            .ToListAsync();

        var logsByDate = logs.ToDictionary(l => l.Date);

        // --- streaks ---
        int currentStreak = 0, longestStreak = 0, tempStreak = 0;
        var checkDate = today;

        // current streak — walk backwards from today
        while (true)
        {
            var diff = checkDate.DayNumber - plan.StartDate.DayNumber;
            var planDay = plan.PlanDays.FirstOrDefault(d => d.DayIndex == diff);
            if (planDay is null) break;
            if (planDay.DayType == DayType.Rest) { checkDate = checkDate.AddDays(-1); continue; }
            if (logsByDate.TryGetValue(checkDate, out var log) && log.IsCompleted)
            { currentStreak++; checkDate = checkDate.AddDays(-1); }
            else break;
        }

        // longest streak — walk forward through all past days
        var scanDate = plan.StartDate;
        while (scanDate <= today)
        {
            var diff = scanDate.DayNumber - plan.StartDate.DayNumber;
            var planDay = plan.PlanDays.FirstOrDefault(d => d.DayIndex == diff);
            if (planDay is null) { scanDate = scanDate.AddDays(1); continue; }
            if (planDay.DayType == DayType.Rest) { scanDate = scanDate.AddDays(1); continue; }

            if (logsByDate.TryGetValue(scanDate, out var log) && log.IsCompleted)
            {
                tempStreak++;
                longestStreak = Math.Max(longestStreak, tempStreak);
            }
            else tempStreak = 0;

            scanDate = scanDate.AddDays(1);
        }

        // --- overall totals ---
        var pastWorkoutDays = plan.PlanDays
            .Where(d => d.DayType != DayType.Rest &&
                        plan.StartDate.AddDays(d.DayIndex) <= today)
            .ToList();

        int totalScheduled = pastWorkoutDays.Count;
        int totalCompleted = pastWorkoutDays
            .Count(d => logsByDate.TryGetValue(
                plan.StartDate.AddDays(d.DayIndex), out var l) && l.IsCompleted);

        int overall = totalScheduled > 0
            ? (int)Math.Round(totalCompleted * 100.0 / totalScheduled) : 0;

        // --- per type consistency ---
        int Consistency(DayType type)
        {
            var typeDays = pastWorkoutDays.Where(d => d.DayType == type).ToList();
            if (typeDays.Count == 0) return 0;
            var done = typeDays.Count(d => logsByDate.TryGetValue(
                plan.StartDate.AddDays(d.DayIndex), out var l) && l.IsCompleted);
            return (int)Math.Round(done * 100.0 / typeDays.Count);
        }

        // --- weekly bars ---
        var weeklyBars = new List<WeeklyBarDto>();
        var weekStart = plan.StartDate;
        while (weekStart <= today)
        {
            var weekEnd = weekStart.AddDays(6);
            if (weekEnd > today) weekEnd = today;

            int wTotal = 0, wDone = 0;
            for (var d = weekStart; d <= weekEnd; d = d.AddDays(1))
            {
                var diff = d.DayNumber - plan.StartDate.DayNumber;
                var planDay = plan.PlanDays.FirstOrDefault(x => x.DayIndex == diff);
                if (planDay is null || planDay.DayType == DayType.Rest) continue;
                wTotal++;
                if (logsByDate.TryGetValue(d, out var l) && l.IsCompleted) wDone++;
            }

            var monthName = weekStart.ToString("MMM");
            var weekNum = ((weekStart.DayNumber - plan.StartDate.DayNumber) / 7) + 1;
            weeklyBars.Add(new WeeklyBarDto($"{monthName} W{weekNum}", wDone, wTotal));
            weekStart = weekStart.AddDays(7);
        }

        // --- exercise stats ---
        var exerciseStats = new List<ExerciseStatsDto>();
        var allTemplates = plan.PlanDays
            .SelectMany(d => d.ExerciseTemplates.Select(e => new { Template = e, d.DayType }))
            .ToList();

        foreach (var item in allTemplates.DistinctBy(x => x.Template.Id))
        {
            var scheduledDays = plan.PlanDays
                .Where(d => d.DayType != DayType.Rest &&
                            d.ExerciseTemplates.Any(e => e.Id == item.Template.Id) &&
                            plan.StartDate.AddDays(d.DayIndex) <= today)
                .ToList();

            int scheduled = scheduledDays.Count;
            int completed = scheduledDays
                .Count(d =>
                {
                    var date = plan.StartDate.AddDays(d.DayIndex);
                    return logsByDate.TryGetValue(date, out var log) &&
                           log.LogEntries.Any(e =>
                               e.ExerciseTemplateId == item.Template.Id && e.IsCompleted);
                });

            int rate = scheduled > 0 ? (int)Math.Round(completed * 100.0 / scheduled) : 0;
            exerciseStats.Add(new ExerciseStatsDto(
                item.Template.Name,
                item.DayType.ToString(),
                completed,
                scheduled,
                rate
            ));
        }

        // --- heatmap (all past days) ---
        var heatmap = new List<CalendarDayDto>();
        for (var d = plan.StartDate; d <= today; d = d.AddDays(1))
        {
            var diff = d.DayNumber - plan.StartDate.DayNumber;
            var planDay = plan.PlanDays.FirstOrDefault(x => x.DayIndex == diff);
            var log = logsByDate.GetValueOrDefault(d);
            heatmap.Add(new CalendarDayDto(
                d,
                planDay?.DayType.ToString() ?? "Rest",
                log != null,
                log?.IsCompleted ?? false,
                planDay?.ExerciseTemplates.Count ?? 0,
                log?.LogEntries.Count(e => e.IsCompleted) ?? 0
            ));
        }

        int daysRemaining = plan.EndDate.DayNumber - today.DayNumber;

        return new DashboardStatsDto(
            currentStreak, longestStreak,
            totalCompleted, totalScheduled,
            overall,
            Consistency(DayType.Chest),
            Consistency(DayType.Back),
            Consistency(DayType.Abs),
            Math.Max(0, daysRemaining),
            weeklyBars,
            exerciseStats,
            heatmap
        );
    }
}