using FootballPrediction.Application.Services;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FootballPrediction.Infrastructure.Jobs;

public class MatchSyncBackgroundJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MatchSyncBackgroundJob> _logger;
    private readonly TimeSpan _period = TimeSpan.FromHours(1);

    public MatchSyncBackgroundJob(
        IServiceProvider serviceProvider,
        ILogger<MatchSyncBackgroundJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using PeriodicTimer timer = new PeriodicTimer(_period);

        while (!stoppingToken.IsCancellationRequested &&
               await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await SyncMatchesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while syncing matches from football-data.org");
            }
        }
    }

    private async Task SyncMatchesAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var footballDataService = scope.ServiceProvider.GetRequiredService<FootballDataService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var dateFrom = DateTime.UtcNow.AddDays(-1);
        var dateTo = DateTime.UtcNow.AddDays(14);

        _logger.LogInformation("Starting match sync for date range {From} to {To}", dateFrom, dateTo);

        var activeCompetitions = await footballDataService.GetActiveCompetitionsAsync();
        var activeCompetitionCodes = activeCompetitions
            .Where(c => c.IsActive)
            .Select(c => c.Code)
            .ToList();

        var totalMatches = 0;
        var newMatches = 0;
        var updatedMatches = 0;

        foreach (var competitionCode in activeCompetitionCodes)
        {
            try
            {
                var matches = await footballDataService.GetMatchesAsync(competitionCode, dateFrom, dateTo);
                totalMatches += matches.Count;

                foreach (var match in matches)
                {
                    if (match.ExternalMatchId == null)
                        continue;

                    var existingMatch = await dbContext.Matches
                        .FirstOrDefaultAsync(m => m.ExternalMatchId == match.ExternalMatchId, cancellationToken);

                    if (existingMatch == null)
                    {
                        dbContext.Matches.Add(match);
                        newMatches++;
                    }
                    else
                    {
                        existingMatch.HomeScore = match.HomeScore;
                        existingMatch.AwayScore = match.AwayScore;
                        existingMatch.IsFinished = match.IsFinished;
                        existingMatch.Venue = match.Venue;
                        existingMatch.Matchday = match.Matchday;
                        existingMatch.KickoffTime = match.KickoffTime;
                        updatedMatches++;
                    }
                }

                await dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Synced {Count} matches for competition {Code}", matches.Count, competitionCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing matches for competition {Code}", competitionCode);
            }
        }

        _logger.LogInformation("Match sync completed. Total: {Total}, New: {New}, Updated: {Updated}",
            totalMatches, newMatches, updatedMatches);
    }
}
