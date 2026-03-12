namespace FootballPrediction.Application.Services;

public class ScoringService : IScoringService
{
    public int CalculatePoints(
        int predictedHomeScore,
        int predictedAwayScore,
        int actualHomeScore,
        int actualAwayScore)
    {
        int predictedDiff = predictedHomeScore - predictedAwayScore;
        int actualDiff = actualHomeScore - actualAwayScore;

        if (predictedHomeScore == actualHomeScore && predictedAwayScore == actualAwayScore)
        {
            return 5;
        }

        if (HasSameWinner(predictedDiff, actualDiff) && Math.Abs(predictedDiff) == Math.Abs(actualDiff))
        {
            return 4;
        }

        if (HasSameWinner(predictedDiff, actualDiff))
        {
            return 3;
        }

        if (predictedHomeScore == actualHomeScore || predictedAwayScore == actualAwayScore)
        {
            return 1;
        }

        return 0;
    }

    private bool HasSameWinner(int predictedDiff, int actualDiff)
    {
        if (predictedDiff == 0 && actualDiff == 0)
        {
            return true;
        }

        return (predictedDiff > 0 && actualDiff > 0) ||
               (predictedDiff < 0 && actualDiff < 0);
    }
}
