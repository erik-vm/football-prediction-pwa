using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces.Repositories;

public interface IGameWeekRepository : IRepository<GameWeek>
{
    Task<GameWeek?> GetByTournamentAndWeekAsync(Guid tournamentId, int weekNumber);
}
