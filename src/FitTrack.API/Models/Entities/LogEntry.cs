namespace FitTrack.API.Models.Entities;

public class LogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DailyLogId { get; set; }
    public Guid ExerciseTemplateId { get; set; }
    public bool IsCompleted { get; set; } = false;
    public string? Notes { get; set; }

    public DailyLog DailyLog { get; set; } = null!;
    public ExerciseTemplate ExerciseTemplate { get; set; } = null!;
}