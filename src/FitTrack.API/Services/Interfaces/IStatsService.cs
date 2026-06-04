using FitTrack.API.DTOs;

namespace FitTrack.API.Services.Interfaces;

public interface IStatsService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(Guid userId, Guid planId);
}