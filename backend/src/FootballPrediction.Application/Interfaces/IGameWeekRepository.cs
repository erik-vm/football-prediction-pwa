using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IGameWeekRepository
{
    Task<IEnumerable<GameWeek>> GetByTournamentIdAsync(Guid tournamentId);
    Task<GameWeek?> GetByIdAsync(Guid id);
    Task AddAsync(GameWeek gameWeek);
    Task UpdateAsync(GameWeek gameWeek);
    Task DeleteAsync(GameWeek gameWeek);
    Task<bool> ExistsAsync(Guid id);
    Task SaveChangesAsync();
}
