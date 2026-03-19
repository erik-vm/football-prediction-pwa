using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IPredictionRepository
{
    Task<IEnumerable<Prediction>> GetAllAsync();
    Task<Prediction?> GetByIdAsync(Guid id);
    Task<IEnumerable<Prediction>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Prediction>> GetByMatchIdAsync(Guid matchId);
    Task<Prediction?> GetByUserAndMatchAsync(Guid userId, Guid matchId);
    Task<Prediction> AddAsync(Prediction prediction);
    Task UpdateAsync(Prediction prediction);
    Task DeleteAsync(Guid id);
}
