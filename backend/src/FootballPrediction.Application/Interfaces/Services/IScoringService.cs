namespace FootballPrediction.Application.Interfaces.Services;

public interface IScoringService
{
    int CalculatePoints(int predictedHome, int predictedAway, int actualHome, int actualAway);
}
