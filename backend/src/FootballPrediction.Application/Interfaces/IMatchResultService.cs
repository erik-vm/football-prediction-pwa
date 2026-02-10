namespace FootballPrediction.Application.Interfaces;

public interface IMatchResultService
{
    Task EnterResultAsync(Guid matchId, int homeScore, int awayScore);
}
