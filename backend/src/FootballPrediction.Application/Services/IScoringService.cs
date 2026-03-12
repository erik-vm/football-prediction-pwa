namespace FootballPrediction.Application.Services;

public interface IScoringService
{
    int CalculatePoints(
        int predictedHomeScore,
        int predictedAwayScore,
        int actualHomeScore,
        int actualAwayScore);
}
