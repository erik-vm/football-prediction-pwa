using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync();
    Task<Match?> GetByIdAsync(Guid id);
    Task<IEnumerable<Match>> GetUpcomingAsync();
    Task<IEnumerable<Match>> GetFinishedAsync();
    Task<IEnumerable<Match>> GetByGameWeekAsync(Guid gameWeekId);
    Task<Match> AddAsync(Match match);
    Task UpdateAsync(Match match);
    Task DeleteAsync(Guid id);
}
