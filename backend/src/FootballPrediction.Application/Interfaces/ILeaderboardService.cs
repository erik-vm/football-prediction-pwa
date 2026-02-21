using FootballPrediction.Application.DTOs.Leaderboard;

namespace FootballPrediction.Application.Interfaces;

public interface ILeaderboardService
{
    Task<IEnumerable<LeaderboardEntryDto>> GetOverallLeaderboardAsync(Guid tournamentId);
    Task<IEnumerable<WeeklyLeaderboardEntryDto>> GetWeeklyLeaderboardAsync(Guid gameWeekId);
    Task CalculateAndApplyWeeklyBonusesAsync(Guid gameWeekId);
}
