namespace FootballPrediction.Application.Services;

public interface IMatchResultService
{
    Task ProcessMatchResultAsync(Guid matchId, int homeScore, int awayScore);
}
