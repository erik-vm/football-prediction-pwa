using FootballPrediction.Application.Interfaces;
using FootballPrediction.Application.Services;
using Microsoft.Extensions.Logging;

namespace FootballPrediction.Infrastructure.Services;

public class ResultProcessingService : IResultProcessingService
{
    private readonly IMatchRepository _matchRepository;
    private readonly IPredictionRepository _predictionRepository;
    private readonly IScoringService _scoringService;
    private readonly ILogger<ResultProcessingService> _logger;

    public ResultProcessingService(
        IMatchRepository matchRepository,
        IPredictionRepository predictionRepository,
        IScoringService scoringService,
        ILogger<ResultProcessingService> logger)
    {
        _matchRepository = matchRepository;
        _predictionRepository = predictionRepository;
        _scoringService = scoringService;
        _logger = logger;
    }

    public async Task ProcessFinishedMatchesAsync()
    {
        try
        {
            _logger.LogInformation("Starting result processing...");

            var finishedMatches = await _matchRepository.GetFinishedAsync();
            var processedCount = 0;

            foreach (var match in finishedMatches)
            {
                if (!match.HomeScore.HasValue || !match.AwayScore.HasValue)
                {
                    _logger.LogWarning("Match {MatchId} marked as finished but missing scores", match.Id);
                    continue;
                }

                var predictions = await _predictionRepository.GetByMatchIdAsync(match.Id);
                var pendingPredictions = predictions.Where(p => p.Status != "SCORED").ToList();

                if (pendingPredictions.Count == 0)
                {
                    continue;
                }

                foreach (var prediction in pendingPredictions)
                {
                    var points = _scoringService.CalculatePoints(
                        prediction.HomeScore,
                        prediction.AwayScore,
                        match.HomeScore.Value,
                        match.AwayScore.Value
                    );

                    prediction.PointsEarned = points;
                    prediction.Status = "SCORED";
                    prediction.UpdatedAt = DateTime.UtcNow;

                    await _predictionRepository.UpdateAsync(prediction);

                    _logger.LogDebug(
                        "Scored prediction {PredictionId} for match {MatchId}: {Points} points",
                        prediction.Id,
                        match.Id,
                        points
                    );
                }

                processedCount++;
            }

            _logger.LogInformation(
                "Result processing complete. Processed {MatchCount} matches with pending predictions",
                processedCount
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during result processing");
            throw;
        }
    }
}
