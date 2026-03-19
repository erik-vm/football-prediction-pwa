using FootballPrediction.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FootballPrediction.Api.BackgroundJobs;

public class FootballDataSyncJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<FootballDataSyncJob> _logger;
    private readonly IConfiguration _configuration;
    private TimeSpan _interval;

    public FootballDataSyncJob(
        IServiceProvider serviceProvider,
        ILogger<FootballDataSyncJob> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;

        var intervalMinutes = _configuration.GetValue<int>("FootballData:SyncIntervalMinutes", 60);
        _interval = TimeSpan.FromMinutes(intervalMinutes);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var apiKey = _configuration["FootballData:ApiKey"];

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Football-data.org API key not configured. FootballDataSyncJob disabled.");
            return;
        }

        _logger.LogInformation("Football Data Sync Job started (interval: {Interval})", _interval);

        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var footballDataService = scope.ServiceProvider
                    .GetRequiredService<IFootballDataService>();

                await footballDataService.UpdateMatchScoresAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Football Data Sync Job");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("Football Data Sync Job stopped");
    }
}
