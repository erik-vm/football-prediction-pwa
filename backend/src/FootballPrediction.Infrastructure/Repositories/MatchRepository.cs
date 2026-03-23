using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class MatchRepository : Repository<Match>, IMatchRepository
{
    public MatchRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Match>> GetUpcomingAsync() =>
        await DbSet.AsNoTracking()
            .Where(m => m.KickoffTime > DateTime.UtcNow && !m.IsFinished)
            .OrderBy(m => m.KickoffTime)
            .ToListAsync();

    public async Task<IEnumerable<Match>> GetFinishedAsync() =>
        await DbSet.AsNoTracking()
            .Where(m => m.IsFinished)
            .OrderByDescending(m => m.KickoffTime)
            .ToListAsync();

    public async Task<IEnumerable<Match>> GetFilteredAsync(string? competitionCode, int? matchday)
    {
        var query = DbSet.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(competitionCode))
            query = query.Where(m => m.CompetitionCode == competitionCode);

        if (matchday.HasValue)
            query = query.Where(m => m.Matchday == matchday.Value);

        return await query.OrderBy(m => m.KickoffTime).ToListAsync();
    }

    public async Task<IEnumerable<string>> GetCompetitionsAsync() =>
        await DbSet.AsNoTracking()
            .Select(m => m.CompetitionCode)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

    public async Task<IEnumerable<int>> GetMatchdaysAsync(string competitionCode) =>
        await DbSet.AsNoTracking()
            .Where(m => m.CompetitionCode == competitionCode && m.Matchday.HasValue)
            .Select(m => m.Matchday!.Value)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();

    public async Task<int?> GetNearestMatchdayAsync(string competitionCode, string tab)
    {
        var query = DbSet.AsNoTracking()
            .Where(m => m.CompetitionCode == competitionCode && m.Matchday.HasValue);

        if (tab == "upcoming")
        {
            return await query
                .Where(m => m.KickoffTime > DateTime.UtcNow && !m.IsFinished)
                .OrderBy(m => m.KickoffTime)
                .Select(m => m.Matchday)
                .FirstOrDefaultAsync();
        }

        return await query
            .Where(m => m.IsFinished)
            .OrderByDescending(m => m.KickoffTime)
            .Select(m => m.Matchday)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Match>> GetByStatusAsync(string status) =>
        await DbSet.AsNoTracking()
            .Where(m => m.Status == status)
            .ToListAsync();

    public async Task<Match?> GetByCompositeKeyAsync(string competitionCode, string homeTeam, string awayTeam, int? matchday) =>
        await DbSet.FirstOrDefaultAsync(m =>
            m.CompetitionCode == competitionCode &&
            m.HomeTeam == homeTeam &&
            m.AwayTeam == awayTeam &&
            m.Matchday == matchday);
}
