using System.Net.Http.Json;
using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FootballPrediction.Infrastructure.Services;

public class FootballDataService : IFootballDataService
{
    private static readonly string[] CompetitionCodes =
        ["PL", "PD", "BL1", "SA", "FL1", "CL", "PPL", "DED", "ELC", "BSA", "WC", "EC"];

    private readonly HttpClient _httpClient;
    private readonly ITournamentRepository _tournamentRepository;
    private readonly IMatchRepository _matchRepository;
    private readonly IMatchResultService _matchResultService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FootballDataService> _logger;

    public FootballDataService(
        HttpClient httpClient,
        ITournamentRepository tournamentRepository,
        IMatchRepository matchRepository,
        IMatchResultService matchResultService,
        IConfiguration configuration,
        ILogger<FootballDataService> logger)
    {
        _httpClient = httpClient;
        _tournamentRepository = tournamentRepository;
        _matchRepository = matchRepository;
        _matchResultService = matchResultService;
        _configuration = configuration;
        _logger = logger;

        var apiKey = _configuration["FootballData:ApiKey"] ?? "";
        if (!string.IsNullOrEmpty(apiKey))
            _httpClient.DefaultRequestHeaders.Add("X-Auth-Token", apiKey);

        _httpClient.BaseAddress = new Uri(_configuration["FootballData:BaseUrl"] ?? "https://api.football-data.org/v4");
    }

    public async Task SyncAllCompetitionsAsync()
    {
        var delayMs = int.Parse(_configuration["Sync:RateLimitDelayMs"] ?? "6500");

        foreach (var code in CompetitionCodes)
        {
            try
            {
                await SyncCompetitionMatchesAsync(code);
                await Task.Delay(delayMs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync competition {Code}", code);
            }
        }
    }

    public async Task SyncCompetitionMatchesAsync(string competitionCode)
    {
        var response = await _httpClient.GetFromJsonAsync<CompetitionMatchesResponse>(
            $"/v4/competitions/{competitionCode}/matches");

        if (response?.Matches == null || response.Competition == null) return;

        var season = BuildSeasonString(response.Matches.FirstOrDefault()?.Season);
        var tournament = await EnsureTournamentAsync(response.Competition, competitionCode, season);

        foreach (var apiMatch in response.Matches)
        {
            if (apiMatch.HomeTeam == null || apiMatch.AwayTeam == null) continue;

            var existing = await _matchRepository.GetByCompositeKeyAsync(
                competitionCode, apiMatch.HomeTeam.Name, apiMatch.AwayTeam.Name, apiMatch.Matchday);

            if (existing != null)
            {
                var wasFinished = existing.IsFinished;
                existing.Status = MapStatus(apiMatch.Status);
                existing.KickoffTime = apiMatch.UtcDate;
                existing.HomeScore = apiMatch.Score?.FullTime?.Home;
                existing.AwayScore = apiMatch.Score?.FullTime?.Away;
                existing.IsFinished = apiMatch.Status == "FINISHED";

                _matchRepository.Update(existing);
                await _matchRepository.SaveChangesAsync();

                if (!wasFinished && existing.IsFinished)
                    await _matchResultService.ScorePendingPredictionsAsync(existing.Id);
            }
            else
            {
                var match = new Match
                {
                    Id = Guid.NewGuid(),
                    TournamentId = tournament.Id,
                    HomeTeam = apiMatch.HomeTeam.Name,
                    AwayTeam = apiMatch.AwayTeam.Name,
                    KickoffTime = apiMatch.UtcDate,
                    HomeScore = apiMatch.Score?.FullTime?.Home,
                    AwayScore = apiMatch.Score?.FullTime?.Away,
                    Status = MapStatus(apiMatch.Status),
                    CompetitionCode = competitionCode,
                    Season = season,
                    Matchday = apiMatch.Matchday,
                    IsFinished = apiMatch.Status == "FINISHED"
                };

                await _matchRepository.AddAsync(match);
                await _matchRepository.SaveChangesAsync();
            }
        }
    }

    public async Task CleanupDuplicatesAsync()
    {
        var allMatches = (await _matchRepository.GetAllAsync()).ToList();
        var duplicates = allMatches
            .GroupBy(m => new { m.CompetitionCode, m.HomeTeam, m.AwayTeam, m.Matchday })
            .Where(g => g.Count() > 1)
            .SelectMany(g => g.Skip(1));

        foreach (var dup in duplicates)
        {
            _matchRepository.Delete(dup);
        }

        await _matchRepository.SaveChangesAsync();
    }

    private async Task<Tournament> EnsureTournamentAsync(CompetitionInfo comp, string code, string season)
    {
        var existing = await _tournamentRepository.GetByCodeAndSeasonAsync(code, season);
        if (existing != null) return existing;

        var tournament = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = comp.Name,
            Code = code,
            Season = season,
            Type = comp.Type,
            LogoUrl = comp.Emblem,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(10)
        };

        await _tournamentRepository.AddAsync(tournament);
        await _tournamentRepository.SaveChangesAsync();
        return tournament;
    }

    private static string BuildSeasonString(ApiSeason? season)
    {
        if (season == null) return DateTime.UtcNow.Year.ToString();
        var start = DateTime.Parse(season.StartDate);
        var end = DateTime.Parse(season.EndDate);
        return $"{start.Year}-{end.Year}";
    }

    private static string MapStatus(string apiStatus) => apiStatus switch
    {
        "SCHEDULED" or "TIMED" => "SCHEDULED",
        "IN_PLAY" or "PAUSED" or "LIVE" => "IN_PLAY",
        "FINISHED" => "FINISHED",
        "POSTPONED" => "POSTPONED",
        "CANCELLED" or "SUSPENDED" => "CANCELLED",
        _ => "SCHEDULED"
    };
}
