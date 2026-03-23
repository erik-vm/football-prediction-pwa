using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces.Repositories;

public interface ITournamentRepository : IRepository<Tournament>
{
    Task<Tournament?> GetByCodeAndSeasonAsync(string code, string season);
}
