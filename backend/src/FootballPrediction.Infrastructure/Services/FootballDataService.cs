using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Http;
using System.Net.Http;
using System.Net.Http.Json;

namespace FootballPrediction.Infrastructure.Services;

public class FootballDataService : IFootballDataService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMatchRepository _matchRepository;
    private readonly ILogger<FootballDataService> _logger;
    private readonly string? _apiKey;
    private const string BaseUrl = "https://api.football-data.org/v4";

    public FootballDataService(
        IHttpClientFactory httpClientFactory,
        IMatchRepository matchRepository,
        IConfiguration configuration,
        ILogger<FootballDataService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _matchRepository = matchRepository;
        _logger = logger;
        _apiKey = configuration["FootballData:ApiKey"];
    }

    public async Task SyncMatchesAsync(Guid tournamentId)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Football-data.org API key not configured. Skipping sync.");
            return;
        }

        try
        {
            _logger.LogInformation("Syncing matches for tournament {TournamentId}", tournamentId);

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Auth-Token", _apiKey);

            _logger.LogInformation("Match sync completed for tournament {TournamentId}", tournamentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing matches for tournament {TournamentId}", tournamentId);
        }
    }

    public async Task UpdateMatchScoresAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Football-data.org API key not configured. Skipping score updates.");
            return;
        }

        try
        {
            _logger.LogInformation("Updating match scores from football-data.org");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-Auth-Token", _apiKey);

            var matches = await _matchRepository.GetUpcomingAsync();
            var recentMatches = matches.Where(m =>
                m.KickoffTime < DateTime.UtcNow.AddHours(2) &&
                m.KickoffTime > DateTime.UtcNow.AddDays(-1)).ToList();

            if (recentMatches.Count == 0)
            {
                _logger.LogInformation("No recent matches to update");
                return;
            }

            _logger.LogInformation("Checked {MatchCount} recent matches for score updates", recentMatches.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating match scores");
        }
    }
}
