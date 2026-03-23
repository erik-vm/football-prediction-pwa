using FootballPrediction.Application.Interfaces.Services;

namespace FootballPrediction.Infrastructure.Services;

public class ScoringService : IScoringService
{
    public int CalculatePoints(int predictedHome, int predictedAway, int actualHome, int actualAway)
    {
        if (predictedHome == actualHome && predictedAway == actualAway)
            return 5;

        int predictedDiff = predictedHome - predictedAway;
        int actualDiff = actualHome - actualAway;
        bool sameWinner = Math.Sign(predictedDiff) == Math.Sign(actualDiff);

        if (sameWinner && predictedDiff == actualDiff)
            return 4;

        if (sameWinner)
            return 3;

        if (predictedHome == actualHome || predictedAway == actualAway)
            return 1;

        return 0;
    }
}
