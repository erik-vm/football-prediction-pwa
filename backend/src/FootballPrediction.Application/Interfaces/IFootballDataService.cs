namespace FootballPrediction.Application.Interfaces;

public interface IFootballDataService
{
    Task SyncMatchesAsync(Guid tournamentId);
    Task SyncAllCompetitionsAsync();
    Task UpdateMatchScoresAsync();
    Task<int> CleanupDuplicatesAsync();
}
