using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync();
    Task<Match?> GetByIdAsync(Guid id);
    Task<IEnumerable<Match>> GetUpcomingAsync();
    Task<IEnumerable<Match>> GetFinishedAsync();
    Task<IEnumerable<Match>> GetByGameWeekAsync(Guid gameWeekId);
    Task<IEnumerable<Match>> GetFilteredAsync(string? competitionCode, int? matchday);
    Task<IEnumerable<string>> GetDistinctCompetitionCodesAsync();
    Task<IEnumerable<int>> GetDistinctMatchdaysAsync(string? competitionCode);
    Task<int?> GetNearestMatchdayAsync(string competitionCode, string tab);
    Task<Match> AddAsync(Match match);
    Task UpdateAsync(Match match);
    Task DeleteAsync(Guid id);
}
