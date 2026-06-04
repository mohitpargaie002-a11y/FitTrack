namespace FitTrack.API.Models.Entities;

public class ExerciseTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlanDayId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Sets { get; set; }
    public string Reps { get; set; } = string.Empty;  // e.g. "10-15" or "30 sec"
    public int OrderIndex { get; set; }

    public PlanDay PlanDay { get; set; } = null!;
}