using FootballPrediction.Application.Interfaces.Services;

namespace FootballPrediction.Api.BackgroundJobs;

public class ResultProcessingBackgroundJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ResultProcessingBackgroundJob> _logger;

    public ResultProcessingBackgroundJob(
        IServiceProvider serviceProvider,
        ILogger<ResultProcessingBackgroundJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var processingService = scope.ServiceProvider.GetRequiredService<IResultProcessingService>();
                await processingService.ProcessFinishedMatchesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Result processing failed");
            }

            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }
}
