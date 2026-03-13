using Microsoft.EntityFrameworkCore;
using FootballPrediction.Application.Services;
using FootballPrediction.Application.DTOs.Leaderboard;
using FootballPrediction.Infrastructure.Data;

namespace FootballPrediction.Infrastructure.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly ApplicationDbContext _context;

    public LeaderboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LeaderboardEntryDto>> GetOverallLeaderboardAsync(Guid tournamentId)
    {
        var leaderboard = await _context.Predictions
            .Where(p => p.Match.TournamentId == tournamentId && p.PointsEarned != null)
            .GroupBy(p => new { p.UserId, p.User.Username })
            .Select(g => new LeaderboardEntryDto
            {
                UserId = g.Key.UserId,
                Username = g.Key.Username,
                TotalPoints = g.Sum(p => p.PointsEarned!.Value),
                TotalPredictions = g.Count(),
                AveragePoints = Math.Round(g.Average(p => p.PointsEarned!.Value), 2)
            })
            .OrderByDescending(e => e.TotalPoints)
            .ThenByDescending(e => e.TotalPredictions)
            .ToListAsync();

        int rank = 1;
        foreach (var entry in leaderboard)
        {
            entry.Rank = rank++;
        }

        return leaderboard;
    }
}
