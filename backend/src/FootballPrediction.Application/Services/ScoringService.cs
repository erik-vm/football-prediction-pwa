using FootballPrediction.Application.Interfaces;

namespace FootballPrediction.Application.Services;

public class ScoringService : IScoringService
{
    public int CalculatePoints(int? predictedHome, int? predictedAway, int? actualHome, int? actualAway)
    {
        if (!predictedHome.HasValue || !predictedAway.HasValue ||
            !actualHome.HasValue || !actualAway.HasValue)
        {
            return 0;
        }

        // Exact score match: 5 points
        if (predictedHome == actualHome && predictedAway == actualAway)
        {
            return 5;
        }

        var predictedDiff = predictedHome.Value - predictedAway.Value;
        var actualDiff = actualHome.Value - actualAway.Value;

        // Correct winner AND correct goal difference: 4 points
        if (HasSameWinner(predictedDiff, actualDiff) &&
            Math.Abs(predictedDiff) == Math.Abs(actualDiff))
        {
            return 4;
        }

        // Correct winner only: 3 points
        if (HasSameWinner(predictedDiff, actualDiff))
        {
            return 3;
        }

        // One team's score correct: 1 point
        if (predictedHome == actualHome || predictedAway == actualAway)
        {
            return 1;
        }

        return 0;
    }

    private bool HasSameWinner(int predictedDiff, int actualDiff)
    {
        // Both are draws
        if (predictedDiff == 0 && actualDiff == 0)
        {
            return true;
        }
        // Both have same winner (home or away)
        return (predictedDiff > 0 && actualDiff > 0) ||
               (predictedDiff < 0 && actualDiff < 0);
    }
}
