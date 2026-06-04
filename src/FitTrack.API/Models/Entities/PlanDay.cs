namespace FitTrack.API.Models.Entities;

public enum DayType { Chest, Back, Abs, Rest }

public class PlanDay
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkoutPlanId { get; set; }
    public int DayIndex { get; set; }        // 0-based position in the plan
    public DayType DayType { get; set; }

    public WorkoutPlan WorkoutPlan { get; set; } = null!;
    public ICollection<ExerciseTemplate> ExerciseTemplates { get; set; } = [];
    public ICollection<DailyLog> DailyLogs { get; set; } = [];
}