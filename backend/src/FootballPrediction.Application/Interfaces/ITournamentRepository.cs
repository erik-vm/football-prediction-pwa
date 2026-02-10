using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface ITournamentRepository
{
    Task<IEnumerable<Tournament>> GetAllAsync();
    Task<Tournament?> GetByIdAsync(Guid id);
    Task<Tournament?> GetActiveAsync();
    Task AddAsync(Tournament tournament);
    Task UpdateAsync(Tournament tournament);
    Task DeleteAsync(Tournament tournament);
    Task<bool> ExistsAsync(Guid id);
    Task SaveChangesAsync();
}
