using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IUserCompetitionStatsRepository
{
    Task<UserCompetitionStats?> GetOrCreateAsync(Guid userId, string competitionCode);
    Task UpdateAsync(UserCompetitionStats stats);
    Task<IEnumerable<UserCompetitionStats>> GetLeaderboardAsync(string competitionCode, int limit);
    Task RecalculateRanksAsync(string competitionCode);
    Task SaveChangesAsync();
}
