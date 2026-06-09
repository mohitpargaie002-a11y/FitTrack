namespace FitTrack.API.Models.Entities;

public class CycleConfig
{
    public int WorkDays { get; set; }
    public int RestDays { get; set; }
    public List<string> Slots { get; set; } = [];
}