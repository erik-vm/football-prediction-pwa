using Microsoft.EntityFrameworkCore;
using FootballPrediction.Application.Services;
using FootballPrediction.Infrastructure.Data;

namespace FootballPrediction.Infrastructure.Services;

public class MatchResultService : IMatchResultService
{
    private readonly ApplicationDbContext _context;
    private readonly IScoringService _scoringService;

    public MatchResultService(ApplicationDbContext context, IScoringService scoringService)
    {
        _context = context;
        _scoringService = scoringService;
    }

    public async Task ProcessMatchResultAsync(Guid matchId, int homeScore, int awayScore)
    {
        var match = await _context.Matches.FindAsync(matchId);
        if (match == null)
            throw new InvalidOperationException("Match not found");

        match.HomeScore = homeScore;
        match.AwayScore = awayScore;
        match.IsFinished = true;
        match.Status = "FINISHED";

        var predictions = await _context.Predictions
            .Where(p => p.MatchId == matchId)
            .ToListAsync();

        foreach (var prediction in predictions)
        {
            var points = _scoringService.CalculatePoints(
                prediction.HomeScore,
                prediction.AwayScore,
                homeScore,
                awayScore
            );

            prediction.PointsEarned = points;
            prediction.Status = "SCORED";
        }

        await _context.SaveChangesAsync();
    }
}
