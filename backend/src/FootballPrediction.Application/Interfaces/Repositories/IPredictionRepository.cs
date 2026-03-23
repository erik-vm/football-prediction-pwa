using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces.Repositories;

public interface IPredictionRepository : IRepository<Prediction>
{
    Task<IEnumerable<Prediction>> GetByUserAsync(Guid userId);
    Task<Prediction?> GetByMatchAndUserAsync(Guid matchId, Guid userId);
    Task<IEnumerable<Prediction>> GetPendingByMatchAsync(Guid matchId);
    Task<IEnumerable<Prediction>> GetScoredByCompetitionAsync(string competitionCode);
    Task<IEnumerable<Prediction>> GetScoredByTournamentAsync(Guid tournamentId);
}
