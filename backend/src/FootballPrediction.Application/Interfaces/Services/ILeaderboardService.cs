using FootballPrediction.Application.DTOs;

namespace FootballPrediction.Application.Interfaces.Services;

public interface ILeaderboardService
{
    Task<IEnumerable<LeaderboardEntryDto>> GetOverallLeaderboardAsync(Guid tournamentId);
    Task<IEnumerable<LeaderboardEntryDto>> GetByCompetitionAsync(string competitionCode);
}
