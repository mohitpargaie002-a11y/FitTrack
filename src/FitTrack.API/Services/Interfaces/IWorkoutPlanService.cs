using FitTrack.API.DTOs;

namespace FitTrack.API.Services.Interfaces;

public interface IWorkoutPlanService
{
    Task<WorkoutPlanDto> CreatePlanAsync(Guid userId, CreatePlanRequest request);
    Task<WorkoutPlanDto?> GetPlanAsync(Guid userId, Guid planId);
    Task<List<WorkoutPlanDto>> GetAllPlansAsync(Guid userId);
    Task SeedDefaultPlanAsync(Guid userId, DateOnly startDate);
}