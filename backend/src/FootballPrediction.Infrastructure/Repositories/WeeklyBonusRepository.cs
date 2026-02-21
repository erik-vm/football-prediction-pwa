using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class WeeklyBonusRepository : IWeeklyBonusRepository
{
    private readonly ApplicationDbContext _context;

    public WeeklyBonusRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WeeklyBonus>> GetByGameWeekIdAsync(Guid gameWeekId)
    {
        return await _context.WeeklyBonuses
            .Where(wb => wb.GameWeekId == gameWeekId)
            .ToListAsync();
    }

    public async Task<IEnumerable<WeeklyBonus>> GetByTournamentIdAsync(Guid tournamentId)
    {
        return await _context.WeeklyBonuses
            .Include(wb => wb.GameWeek)
            .Where(wb => wb.GameWeek.TournamentId == tournamentId)
            .ToListAsync();
    }

    public async Task AddRangeAsync(IEnumerable<WeeklyBonus> bonuses)
    {
        await _context.WeeklyBonuses.AddRangeAsync(bonuses);
    }

    public async Task RemoveRangeAsync(IEnumerable<WeeklyBonus> bonuses)
    {
        _context.WeeklyBonuses.RemoveRange(bonuses);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
