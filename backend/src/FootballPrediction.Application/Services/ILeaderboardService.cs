using FootballPrediction.Application.DTOs.Leaderboard;

namespace FootballPrediction.Application.Services;

public interface ILeaderboardService
{
    Task<IEnumerable<LeaderboardEntryDto>> GetOverallLeaderboardAsync(Guid tournamentId);
    Task<IEnumerable<LeaderboardEntryDto>> GetByCompetitionAsync(string competitionCode);
}
