using FitTrack.API.DTOs;

namespace FitTrack.API.Services.Interfaces;

public interface IWorkoutPlanService
{
    Task<WorkoutPlanDto> CreatePlanAsync(Guid userId, CreatePlanRequest request);
    Task<WorkoutPlanDto?> GetPlanAsync(Guid userId, Guid planId);
    Task<List<WorkoutPlanDto>> GetAllPlansAsync(Guid userId);
    Task SeedDefaultPlanAsync(Guid userId, DateOnly startDate);
    Task<WorkoutPlanV2Dto> CreatePlanV2Async(Guid userId, CreatePlanV2Request request);
    Task<WorkoutPlanV2Dto?> GetPlanV2Async(Guid userId, Guid planId);
    Task<List<WorkoutPlanV2Dto>> GetAllPlansV2Async(Guid userId);
    Task DeletePlanAsync(Guid userId, Guid planId);
    Task<WorkoutPlanV2Dto> UpdateDayExercisesAsync(
    Guid userId, Guid planId, string dayType, List<ExerciseInputDto> exercises);
}