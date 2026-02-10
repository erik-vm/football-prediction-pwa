using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IPredictionRepository
{
    Task<IEnumerable<Prediction>> GetByMatchIdAsync(Guid matchId);
    Task UpdateAsync(Prediction prediction);
    Task SaveChangesAsync();
}
