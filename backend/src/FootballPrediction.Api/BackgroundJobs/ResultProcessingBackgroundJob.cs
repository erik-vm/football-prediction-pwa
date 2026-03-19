using FootballPrediction.Application.Interfaces;

namespace FootballPrediction.Api.BackgroundJobs;

public class ResultProcessingBackgroundJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ResultProcessingBackgroundJob> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(30);

    public ResultProcessingBackgroundJob(
        IServiceProvider serviceProvider,
        ILogger<ResultProcessingBackgroundJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Result Processing Background Job started");

        // Initial delay to avoid running immediately on startup
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var resultProcessingService = scope.ServiceProvider
                    .GetRequiredService<IResultProcessingService>();

                await resultProcessingService.ProcessFinishedMatchesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Result Processing Background Job");
            }

            // Wait for next interval
            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("Result Processing Background Job stopped");
    }
}
