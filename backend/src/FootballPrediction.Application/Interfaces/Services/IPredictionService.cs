using FootballPrediction.Application.DTOs;

namespace FootballPrediction.Application.Interfaces.Services;

public interface IPredictionService
{
    Task<PredictionDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PredictionDto>> GetByUserAsync(Guid userId);
    Task<PredictionDto?> GetByMatchAndUserAsync(Guid matchId, Guid userId);
    Task<PredictionDto?> CreateAsync(Guid userId, PredictionRequest request);
    Task<bool> UpdateAsync(Guid id, Guid userId, PredictionRequest request);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
