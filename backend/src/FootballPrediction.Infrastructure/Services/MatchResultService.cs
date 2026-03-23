using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;

namespace FootballPrediction.Infrastructure.Services;

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

    public async Task<bool> ProcessMatchResultAsync(Guid matchId, int homeScore, int awayScore)
    {
        var match = await _matchRepository.GetByIdAsync(matchId);
        if (match == null) return false;

        match.HomeScore = homeScore;
        match.AwayScore = awayScore;
        match.Status = "FINISHED";
        match.IsFinished = true;

        _matchRepository.Update(match);
        await _matchRepository.SaveChangesAsync();

        await ScorePendingPredictionsAsync(matchId);
        return true;
    }

    public async Task ScorePendingPredictionsAsync(Guid matchId)
    {
        var match = await _matchRepository.GetByIdAsync(matchId);
        if (match?.HomeScore == null || match.AwayScore == null) return;

        var predictions = await _predictionRepository.GetPendingByMatchAsync(matchId);
        foreach (var prediction in predictions)
        {
            prediction.PointsEarned = _scoringService.CalculatePoints(
                prediction.HomeScore, prediction.AwayScore,
                match.HomeScore.Value, match.AwayScore.Value);
            prediction.Status = "SCORED";
            prediction.CompetitionCode = match.CompetitionCode;
            _predictionRepository.Update(prediction);
        }

        await _predictionRepository.SaveChangesAsync();
    }
}
