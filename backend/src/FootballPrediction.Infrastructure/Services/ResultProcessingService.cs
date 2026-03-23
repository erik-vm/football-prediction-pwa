using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace FootballPrediction.Infrastructure.Services;

public class ResultProcessingService : IResultProcessingService
{
    private readonly IMatchRepository _matchRepository;
    private readonly IMatchResultService _matchResultService;
    private readonly ILogger<ResultProcessingService> _logger;

    public ResultProcessingService(
        IMatchRepository matchRepository,
        IMatchResultService matchResultService,
        ILogger<ResultProcessingService> logger)
    {
        _matchRepository = matchRepository;
        _matchResultService = matchResultService;
        _logger = logger;
    }

    public async Task ProcessFinishedMatchesAsync()
    {
        var finishedMatches = await _matchRepository.GetByStatusAsync("FINISHED");

        foreach (var match in finishedMatches)
        {
            try
            {
                await _matchResultService.ScorePendingPredictionsAsync(match.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process match {MatchId}", match.Id);
            }
        }
    }
}
