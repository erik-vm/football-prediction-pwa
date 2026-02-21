using FootballPrediction.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FootballPrediction.Application.Jobs;

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

        var dateFrom = DateTime.UtcNow.AddDays(-1);
        var dateTo = DateTime.UtcNow.AddDays(14);

        _logger.LogInformation("Starting match sync for date range {From} to {To}", dateFrom, dateTo);
    }
}
