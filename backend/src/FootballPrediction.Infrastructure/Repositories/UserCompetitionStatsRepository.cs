using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class UserCompetitionStatsRepository : IUserCompetitionStatsRepository
{
    private readonly ApplicationDbContext _context;

    public UserCompetitionStatsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserCompetitionStats?> GetOrCreateAsync(Guid userId, string competitionCode)
    {
        var stats = await _context.UserCompetitionStats
            .FirstOrDefaultAsync(s => s.UserId == userId && s.CompetitionCode == competitionCode);

        if (stats == null)
        {
            stats = new UserCompetitionStats
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CompetitionCode = competitionCode,
                TotalPoints = 0,
                TotalPredictions = 0,
                Accuracy = 0,
                Rank = null,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.UserCompetitionStats.AddAsync(stats);
        }

        return stats;
    }

    public async Task UpdateAsync(UserCompetitionStats stats)
    {
        stats.UpdatedAt = DateTime.UtcNow;
        _context.UserCompetitionStats.Update(stats);
    }

    public async Task<IEnumerable<UserCompetitionStats>> GetLeaderboardAsync(string competitionCode, int limit)
    {
        return await _context.UserCompetitionStats
            .Include(s => s.User)
            .Where(s => s.CompetitionCode == competitionCode)
            .OrderBy(s => s.Rank)
            .Take(limit)
            .ToListAsync();
    }

    public async Task RecalculateRanksAsync(string competitionCode)
    {
        var allStats = await _context.UserCompetitionStats
            .Where(s => s.CompetitionCode == competitionCode)
            .OrderByDescending(s => s.TotalPoints)
            .ThenByDescending(s => s.Accuracy)
            .ToListAsync();

        int rank = 1;
        foreach (var stats in allStats)
        {
            stats.Rank = rank++;
            stats.UpdatedAt = DateTime.UtcNow;
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
