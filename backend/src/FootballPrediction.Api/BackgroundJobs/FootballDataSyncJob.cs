using FootballPrediction.Application.Interfaces.Services;

namespace FootballPrediction.Api.BackgroundJobs;

public class FootballDataSyncJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<FootballDataSyncJob> _logger;
    private readonly IConfiguration _configuration;

    public FootballDataSyncJob(
        IServiceProvider serviceProvider,
        ILogger<FootballDataSyncJob> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = int.Parse(_configuration["Sync:IntervalMinutes"] ?? "60");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Starting football data sync at {Time}", DateTime.UtcNow);

                using var scope = _serviceProvider.CreateScope();
                var syncService = scope.ServiceProvider.GetRequiredService<IFootballDataService>();
                await syncService.SyncAllCompetitionsAsync();

                _logger.LogInformation("Football data sync completed at {Time}", DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Football data sync failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
        }
    }
}
