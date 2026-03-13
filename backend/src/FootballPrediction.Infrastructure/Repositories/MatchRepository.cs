using Microsoft.EntityFrameworkCore;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;

namespace FootballPrediction.Infrastructure.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly ApplicationDbContext _context;

    public MatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Match>> GetAllAsync()
    {
        return await _context.Matches.Include(m => m.Tournament).ToListAsync();
    }

    public async Task<Match?> GetByIdAsync(Guid id)
    {
        return await _context.Matches
            .Include(m => m.Tournament)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Match>> GetUpcomingAsync()
    {
        return await _context.Matches
            .Where(m => m.KickoffTime > DateTime.UtcNow && !m.IsFinished)
            .OrderBy(m => m.KickoffTime)
            .Include(m => m.Tournament)
            .ToListAsync();
    }

    public async Task<IEnumerable<Match>> GetFinishedAsync()
    {
        return await _context.Matches
            .Where(m => m.IsFinished)
            .OrderByDescending(m => m.KickoffTime)
            .Include(m => m.Tournament)
            .ToListAsync();
    }

    public async Task<IEnumerable<Match>> GetByGameWeekAsync(Guid gameWeekId)
    {
        return await _context.Matches
            .Where(m => m.GameWeekId == gameWeekId)
            .Include(m => m.Tournament)
            .OrderBy(m => m.KickoffTime)
            .ToListAsync();
    }

    public async Task<Match> AddAsync(Match match)
    {
        _context.Matches.Add(match);
        await _context.SaveChangesAsync();
        return match;
    }

    public async Task UpdateAsync(Match match)
    {
        _context.Matches.Update(match);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var match = await GetByIdAsync(id);
        if (match != null)
        {
            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();
        }
    }
}
