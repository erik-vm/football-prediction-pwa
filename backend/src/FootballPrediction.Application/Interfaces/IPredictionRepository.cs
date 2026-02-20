using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IPredictionRepository
{
    Task<Prediction?> GetByIdAsync(Guid id);
    Task<Prediction?> GetByUserAndMatchAsync(Guid userId, Guid matchId);
    Task<IEnumerable<Prediction>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Prediction>> GetByMatchIdAsync(Guid matchId);
    Task<Prediction> CreateAsync(Prediction prediction);
    Task UpdateAsync(Prediction prediction);
    Task DeleteAsync(Prediction prediction);
    Task SaveChangesAsync();
}
