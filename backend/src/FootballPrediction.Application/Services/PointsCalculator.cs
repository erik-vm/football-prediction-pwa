namespace FootballPrediction.Application.Services;

public static class PointsCalculator
{
    public static int Calculate(
        int predictedHome, int predictedAway,
        int actualHome, int actualAway)
    {
        if (predictedHome == actualHome && predictedAway == actualAway)
            return 5;

        int predDiff = predictedHome - predictedAway;
        int actualDiff = actualHome - actualAway;

        if (predDiff == actualDiff)
            return 2;

        if (Math.Sign(predDiff) == Math.Sign(actualDiff))
            return 3;

        return 0;
    }

    public static decimal CalculateAccuracy(int totalPoints, int totalPredictions)
    {
        if (totalPredictions == 0)
            return 0;

        return Math.Round((decimal)totalPoints / (totalPredictions * 5) * 100, 2);
    }
}
