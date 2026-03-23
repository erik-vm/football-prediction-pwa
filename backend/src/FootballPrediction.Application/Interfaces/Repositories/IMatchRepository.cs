using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces.Repositories;

public interface IMatchRepository : IRepository<Match>
{
    Task<IEnumerable<Match>> GetUpcomingAsync();
    Task<IEnumerable<Match>> GetFinishedAsync();
    Task<IEnumerable<Match>> GetFilteredAsync(string? competitionCode, int? matchday);
    Task<IEnumerable<string>> GetCompetitionsAsync();
    Task<IEnumerable<int>> GetMatchdaysAsync(string competitionCode);
    Task<int?> GetNearestMatchdayAsync(string competitionCode, string tab);
    Task<IEnumerable<Match>> GetByStatusAsync(string status);
    Task<Match?> GetByCompositeKeyAsync(string competitionCode, string homeTeam, string awayTeam, int? matchday);
}
