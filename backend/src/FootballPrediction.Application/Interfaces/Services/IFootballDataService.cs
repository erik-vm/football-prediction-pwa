namespace FootballPrediction.Application.Interfaces.Services;

public interface IFootballDataService
{
    Task SyncAllCompetitionsAsync();
    Task SyncCompetitionMatchesAsync(string competitionCode);
    Task CleanupDuplicatesAsync();
}
