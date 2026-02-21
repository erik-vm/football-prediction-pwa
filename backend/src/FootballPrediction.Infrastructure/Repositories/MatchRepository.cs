using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly ApplicationDbContext _context;

    public MatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Match>> GetByGameWeekIdAsync(Guid gameWeekId)
    {
        return await _context.Matches
            .Where(m => m.GameWeekId == gameWeekId)
            .OrderBy(m => m.KickoffTime)
            .ToListAsync();
    }

    public async Task<Match?> GetByIdAsync(Guid id)
    {
        return await _context.Matches
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Match>> GetUpcomingAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.Matches
            .Where(m => !m.IsFinished && m.KickoffTime > now)
            .OrderBy(m => m.KickoffTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Match>> GetFinishedAsync()
    {
        return await _context.Matches
            .Where(m => m.IsFinished)
            .OrderByDescending(m => m.KickoffTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Match>> GetFilteredAsync(string? competitionCode = null, bool? isFinished = null, int? matchday = null)
    {
        var query = _context.Matches.AsQueryable();

        if (!string.IsNullOrEmpty(competitionCode))
        {
            query = query.Where(m => m.CompetitionCode == competitionCode);
        }

        if (isFinished.HasValue)
        {
            query = query.Where(m => m.IsFinished == isFinished.Value);
        }

        if (matchday.HasValue)
        {
            query = query.Where(m => m.Matchday == matchday.Value);
        }

        return await query
            .OrderBy(m => m.KickoffTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Guid>> GetFinishedMatchIdsByTournamentAsync(Guid tournamentId)
    {
        return await _context.Matches
            .Include(m => m.GameWeek)
            .Where(m => m.GameWeek.TournamentId == tournamentId && m.IsFinished)
            .Select(m => m.Id)
            .ToListAsync();
    }

    public async Task<IEnumerable<Guid>> GetFinishedMatchIdsByGameWeekAsync(Guid gameWeekId)
    {
        return await _context.Matches
            .Where(m => m.GameWeekId == gameWeekId && m.IsFinished)
            .Select(m => m.Id)
            .ToListAsync();
    }

    public async Task AddAsync(Match match)
    {
        await _context.Matches.AddAsync(match);
    }

    public async Task UpdateAsync(Match match)
    {
        _context.Matches.Update(match);
    }

    public async Task DeleteAsync(Match match)
    {
        _context.Matches.Remove(match);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Matches.AnyAsync(m => m.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
