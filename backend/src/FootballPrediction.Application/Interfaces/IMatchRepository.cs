using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetByGameWeekIdAsync(Guid gameWeekId);
    Task<Match?> GetByIdAsync(Guid id);
    Task<IEnumerable<Match>> GetUpcomingAsync();
    Task<IEnumerable<Match>> GetFinishedAsync();
    Task<IEnumerable<Match>> GetFilteredAsync(string? competitionCode = null, bool? isFinished = null, int? matchday = null);
    Task<IEnumerable<Guid>> GetFinishedMatchIdsByTournamentAsync(Guid tournamentId);
    Task<IEnumerable<Guid>> GetFinishedMatchIdsByGameWeekAsync(Guid gameWeekId);
    Task AddAsync(Match match);
    Task UpdateAsync(Match match);
    Task DeleteAsync(Match match);
    Task<bool> ExistsAsync(Guid id);
    Task SaveChangesAsync();
}
