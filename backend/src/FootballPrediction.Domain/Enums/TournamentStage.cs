namespace FootballPrediction.Domain.Enums;

public enum TournamentStage
{
    GROUP_STAGE = 1,
    ROUND_OF_16 = 2,
    QUARTER_FINALS = 3,
    SEMI_FINALS = 4,
    FINAL = 5
}

public static class TournamentStageExtensions
{
    public static int GetMultiplier(this TournamentStage stage)
    {
        return (int)stage;
    }
}
