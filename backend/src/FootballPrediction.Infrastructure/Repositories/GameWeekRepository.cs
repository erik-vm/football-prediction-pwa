using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class GameWeekRepository : IGameWeekRepository
{
    private readonly ApplicationDbContext _context;

    public GameWeekRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GameWeek>> GetByTournamentIdAsync(Guid tournamentId)
    {
        return await _context.GameWeeks
            .Where(gw => gw.TournamentId == tournamentId)
            .OrderBy(gw => gw.WeekNumber)
            .ToListAsync();
    }

    public async Task<GameWeek?> GetByIdAsync(Guid id)
    {
        return await _context.GameWeeks
            .FirstOrDefaultAsync(gw => gw.Id == id);
    }

    public async Task AddAsync(GameWeek gameWeek)
    {
        await _context.GameWeeks.AddAsync(gameWeek);
    }

    public async Task UpdateAsync(GameWeek gameWeek)
    {
        _context.GameWeeks.Update(gameWeek);
    }

    public async Task DeleteAsync(GameWeek gameWeek)
    {
        _context.GameWeeks.Remove(gameWeek);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.GameWeeks.AnyAsync(gw => gw.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
