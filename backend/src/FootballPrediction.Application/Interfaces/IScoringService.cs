namespace FootballPrediction.Application.Interfaces;

public interface IScoringService
{
    int CalculatePoints(int? predictedHome, int? predictedAway, int? actualHome, int? actualAway);
}
