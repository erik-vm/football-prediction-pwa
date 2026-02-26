using FootballPrediction.Application.Interfaces;
using FootballPrediction.Application.Services;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FootballPrediction.Infrastructure.Jobs;

public class ResultProcessingBackgroundJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ResultProcessingBackgroundJob> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(5);

    public ResultProcessingBackgroundJob(
        IServiceProvider serviceProvider,
        ILogger<ResultProcessingBackgroundJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Running initial result processing on startup");

        try
        {
            await ProcessResultsAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during initial result processing");
        }

        using PeriodicTimer timer = new PeriodicTimer(_period);

        while (!stoppingToken.IsCancellationRequested &&
               await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessResultsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing match results");
            }
        }
    }

    private async Task ProcessResultsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var statsRepository = scope.ServiceProvider.GetRequiredService<IUserCompetitionStatsRepository>();

        _logger.LogInformation("Starting result processing");

        var finishedMatches = await dbContext.Matches
            .Where(m => m.IsFinished && m.HomeScore.HasValue && m.AwayScore.HasValue)
            .ToListAsync(cancellationToken);

        if (!finishedMatches.Any())
        {
            _logger.LogInformation("No finished matches to process");
            return;
        }

        var finishedMatchIds = finishedMatches.Select(m => m.Id).ToList();

        var unprocessedPredictions = await dbContext.Predictions
            .Include(p => p.Match)
            .Where(p => finishedMatchIds.Contains(p.MatchId) && p.Status == "PENDING")
            .ToListAsync(cancellationToken);

        if (!unprocessedPredictions.Any())
        {
            _logger.LogInformation("No unprocessed predictions found");
            return;
        }

        _logger.LogInformation("Processing {Count} predictions", unprocessedPredictions.Count);

        var competitionCodes = unprocessedPredictions
            .Select(p => p.CompetitionCode)
            .Distinct()
            .ToList();

        foreach (var prediction in unprocessedPredictions)
        {
            var match = prediction.Match;

            if (!match.HomeScore.HasValue || !match.AwayScore.HasValue)
                continue;

            var points = PointsCalculator.Calculate(
                prediction.HomeScore,
                prediction.AwayScore,
                match.HomeScore.Value,
                match.AwayScore.Value
            );

            prediction.PointsEarned = points;
            prediction.Status = "SCORED";
            prediction.UpdatedAt = DateTime.UtcNow;

            var stats = await statsRepository.GetOrCreateAsync(prediction.UserId, prediction.CompetitionCode);

            if (stats != null)
            {
                stats.TotalPoints += points;
                stats.TotalPredictions += 1;
                stats.Accuracy = PointsCalculator.CalculateAccuracy(stats.TotalPoints, stats.TotalPredictions);
                stats.UpdatedAt = DateTime.UtcNow;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var competitionCode in competitionCodes)
        {
            await statsRepository.RecalculateRanksAsync(competitionCode);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Result processing completed. Processed {Count} predictions", unprocessedPredictions.Count);
    }
}
