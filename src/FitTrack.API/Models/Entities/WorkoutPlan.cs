using System.Text.Json;

namespace FitTrack.API.Models.Entities;

public class WorkoutPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string CycleConfigJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<PlanDay> PlanDays { get; set; } = [];

    // Helper to get/set strongly typed config
    public CycleConfig GetCycleConfig() =>
        JsonSerializer.Deserialize<CycleConfig>(CycleConfigJson) ?? new CycleConfig();

    public void SetCycleConfig(CycleConfig config) =>
        CycleConfigJson = JsonSerializer.Serialize(config);
}