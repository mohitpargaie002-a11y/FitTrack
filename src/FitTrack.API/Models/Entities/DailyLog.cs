namespace FitTrack.API.Models.Entities;

public class DailyLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid PlanDayId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public PlanDay PlanDay { get; set; } = null!;
    public ICollection<LogEntry> LogEntries { get; set; } = [];
}