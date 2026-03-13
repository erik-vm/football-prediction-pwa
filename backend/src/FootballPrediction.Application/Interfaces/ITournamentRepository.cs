using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface ITournamentRepository
{
    Task<IEnumerable<Tournament>> GetAllAsync();
    Task<Tournament?> GetByIdAsync(Guid id);
    Task<Tournament> AddAsync(Tournament tournament);
    Task UpdateAsync(Tournament tournament);
    Task DeleteAsync(Guid id);
}
