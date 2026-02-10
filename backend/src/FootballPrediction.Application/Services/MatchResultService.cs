using FootballPrediction.Application.Interfaces;

namespace FootballPrediction.Application.Services;

public class MatchResultService : IMatchResultService
{
    private readonly IMatchRepository _matchRepository;
    private readonly IPredictionRepository _predictionRepository;
    private readonly IScoringService _scoringService;

    public MatchResultService(
        IMatchRepository matchRepository,
        IPredictionRepository predictionRepository,
        IScoringService scoringService)
    {
        _matchRepository = matchRepository;
        _predictionRepository = predictionRepository;
        _scoringService = scoringService;
    }

    public async Task EnterResultAsync(Guid matchId, int homeScore, int awayScore)
    {
        var match = await _matchRepository.GetByIdAsync(matchId);
        if (match == null)
        {
            throw new InvalidOperationException("Match not found");
        }

        if (match.IsFinished)
        {
            throw new InvalidOperationException("Match result has already been entered");
        }

        // Update match with result
        match.HomeScore = homeScore;
        match.AwayScore = awayScore;
        match.IsFinished = true;

        await _matchRepository.UpdateAsync(match);

        // Get all predictions for this match
        var predictions = await _predictionRepository.GetByMatchIdAsync(matchId);

        // Calculate and update points for each prediction
        foreach (var prediction in predictions)
        {
            var basePoints = _scoringService.CalculatePoints(
                prediction.HomeScore,
                prediction.AwayScore,
                match.HomeScore!.Value,
                match.AwayScore!.Value
            );

            // Apply stage multiplier
            prediction.PointsEarned = basePoints * match.StageMultiplier;

            await _predictionRepository.UpdateAsync(prediction);
        }

        // Save all changes in a single transaction
        await _matchRepository.SaveChangesAsync();
    }
}
