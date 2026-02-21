using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IWeeklyBonusRepository
{
    Task<IEnumerable<WeeklyBonus>> GetByGameWeekIdAsync(Guid gameWeekId);
    Task<IEnumerable<WeeklyBonus>> GetByTournamentIdAsync(Guid tournamentId);
    Task AddRangeAsync(IEnumerable<WeeklyBonus> bonuses);
    Task RemoveRangeAsync(IEnumerable<WeeklyBonus> bonuses);
    Task SaveChangesAsync();
}
