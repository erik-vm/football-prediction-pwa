namespace FootballPrediction.Application.Interfaces.Services;

public interface IMatchResultService
{
    Task<bool> ProcessMatchResultAsync(Guid matchId, int homeScore, int awayScore);
    Task ScorePendingPredictionsAsync(Guid matchId);
}
