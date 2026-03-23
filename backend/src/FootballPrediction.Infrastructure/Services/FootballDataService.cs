using FootballPrediction.Application.Interfaces;
using FootballPrediction.Application.Services;
using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FootballPrediction.Infrastructure.Data;

namespace FootballPrediction.Infrastructure.Services;

public class FootballDataService : IFootballDataService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMatchRepository _matchRepository;
    private readonly ITournamentRepository _tournamentRepository;
    private readonly IScoringService _scoringService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FootballDataService> _logger;
    private readonly string? _apiKey;
    private const string BaseUrl = "https://api.football-data.org/v4";

    private static readonly string[] CompetitionCodes = ["PL", "PD", "BL1", "SA", "FL1", "CL", "PPL", "DED", "ELC", "BSA", "WC", "EC"];

    public FootballDataService(
        IHttpClientFactory httpClientFactory,
        IMatchRepository matchRepository,
        ITournamentRepository tournamentRepository,
        IScoringService scoringService,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<FootballDataService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _matchRepository = matchRepository;
        _tournamentRepository = tournamentRepository;
        _scoringService = scoringService;
        _context = context;
        _logger = logger;
        _apiKey = configuration["FootballData:ApiKey"];
    }

    public async Task SyncAllCompetitionsAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Football-data.org API key not configured.");
            return;
        }

        foreach (var code in CompetitionCodes)
        {
            try
            {
                await SyncCompetitionMatchesAsync(code);
                await Task.Delay(6500);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing competition {Code}", code);
            }
        }
    }

    public async Task SyncMatchesAsync(Guid tournamentId)
    {
        var tournament = await _tournamentRepository.GetByIdAsync(tournamentId);
        if (tournament == null) return;
        await SyncCompetitionMatchesAsync(tournament.Code);
    }

    private async Task SyncCompetitionMatchesAsync(string competitionCode)
    {
        _logger.LogInformation("Syncing matches for competition {Code}", competitionCode);

        var client = CreateClient();
        var currentYear = DateTime.UtcNow.Month >= 7 ? DateTime.UtcNow.Year : DateTime.UtcNow.Year - 1;
        var response = await client.GetAsync($"{BaseUrl}/competitions/{competitionCode}/matches?season={currentYear}");

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("API returned {Status} for {Code}", response.StatusCode, competitionCode);
            return;
        }

        var json = await response.Content.ReadFromJsonAsync<FootballDataMatchesResponse>();
        if (json?.Matches == null) return;

        var season = json.Matches.FirstOrDefault()?.Season?.StartDate?.Year.ToString() ?? DateTime.UtcNow.Year.ToString();
        var seasonStr = $"{season}-{int.Parse(season) + 1}";

        var tournament = await _tournamentRepository.GetByCodeAndSeasonAsync(competitionCode, seasonStr);
        if (tournament == null)
        {
            var comp = json.Competition;
            tournament = await _tournamentRepository.AddAsync(new Tournament
            {
                Id = Guid.NewGuid(),
                Code = competitionCode,
                Name = comp?.Name ?? competitionCode,
                Season = seasonStr,
                Country = comp?.Area?.Name,
                Type = comp?.Type ?? "LEAGUE",
                StartDate = DateTime.UtcNow.AddMonths(-6),
                EndDate = DateTime.UtcNow.AddMonths(6)
            });
        }

        var synced = 0;
        foreach (var m in json.Matches)
        {
            var homeTeam = m.HomeTeam?.Name ?? "TBD";
            var awayTeam = m.AwayTeam?.Name ?? "TBD";
            var kickoff = m.UtcDate ?? DateTime.UtcNow;
            var matchday = m.Matchday;
            var status = MapStatus(m.Status);
            var isFinished = status == "FINISHED";
            int? homeScore = m.Score?.FullTime?.Home;
            int? awayScore = m.Score?.FullTime?.Away;

            var duplicates = await _context.Matches
                .Where(x => x.CompetitionCode == competitionCode
                    && x.HomeTeam == homeTeam
                    && x.AwayTeam == awayTeam
                    && x.Matchday == matchday)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();

            if (duplicates.Count > 1)
            {
                _context.Matches.RemoveRange(duplicates.Skip(1));
            }

            var existing = duplicates.FirstOrDefault();

            if (existing != null)
            {
                existing.Status = status;
                existing.IsFinished = isFinished;
                existing.HomeScore = homeScore;
                existing.AwayScore = awayScore;
                existing.KickoffTime = kickoff;
                _context.Matches.Update(existing);
            }
            else
            {
                _context.Matches.Add(new Match
                {
                    Id = Guid.NewGuid(),
                    TournamentId = tournament.Id,
                    HomeTeam = homeTeam,
                    AwayTeam = awayTeam,
                    KickoffTime = kickoff,
                    Status = status,
                    IsFinished = isFinished,
                    HomeScore = homeScore,
                    AwayScore = awayScore,
                    CompetitionCode = competitionCode,
                    Season = seasonStr,
                    Matchday = matchday
                });
                synced++;
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Synced {Code}: {New} new, {Total} total matches", competitionCode, synced, json.Matches.Count);

        await ScorePendingPredictionsAsync(competitionCode);
    }

    private async Task ScorePendingPredictionsAsync(string competitionCode)
    {
        var finishedMatches = await _context.Matches
            .Where(m => m.CompetitionCode == competitionCode && m.IsFinished
                && m.HomeScore.HasValue && m.AwayScore.HasValue)
            .ToListAsync();

        var scored = 0;
        foreach (var match in finishedMatches)
        {
            var pendingPredictions = await _context.Predictions
                .Where(p => p.MatchId == match.Id && p.Status == "PENDING")
                .ToListAsync();

            foreach (var prediction in pendingPredictions)
            {
                prediction.PointsEarned = _scoringService.CalculatePoints(
                    prediction.HomeScore, prediction.AwayScore,
                    match.HomeScore!.Value, match.AwayScore!.Value);
                prediction.Status = "SCORED";
                prediction.CompetitionCode = competitionCode;
                scored++;
            }
        }

        if (scored > 0)
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Auto-scored {Count} predictions for {Code}", scored, competitionCode);
        }
    }

    public async Task UpdateMatchScoresAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Football-data.org API key not configured. Skipping score updates.");
            return;
        }

        foreach (var code in CompetitionCodes)
        {
            try
            {
                await UpdateRecentMatchesAsync(code);
                await Task.Delay(6500);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating scores for {Code}", code);
            }
        }
    }

    private async Task UpdateRecentMatchesAsync(string competitionCode)
    {
        var client = CreateClient();
        var from = DateTime.UtcNow.AddDays(-3).ToString("yyyy-MM-dd");
        var to = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd");
        var response = await client.GetAsync($"{BaseUrl}/competitions/{competitionCode}/matches?dateFrom={from}&dateTo={to}");

        if (!response.IsSuccessStatusCode) return;

        var json = await response.Content.ReadFromJsonAsync<FootballDataMatchesResponse>();
        if (json?.Matches == null) return;

        foreach (var m in json.Matches)
        {
            var homeTeam = m.HomeTeam?.Name ?? "TBD";
            var awayTeam = m.AwayTeam?.Name ?? "TBD";
            var existing = await _context.Matches
                .FirstOrDefaultAsync(x => x.CompetitionCode == competitionCode
                    && x.HomeTeam == homeTeam && x.AwayTeam == awayTeam
                    && x.Matchday == m.Matchday);

            if (existing != null)
            {
                existing.Status = MapStatus(m.Status);
                existing.IsFinished = existing.Status == "FINISHED";
                existing.HomeScore = m.Score?.FullTime?.Home;
                existing.AwayScore = m.Score?.FullTime?.Away;
                existing.KickoffTime = m.UtcDate ?? existing.KickoffTime;
                _context.Matches.Update(existing);
            }
        }
        await _context.SaveChangesAsync();

        await ScorePendingPredictionsAsync(competitionCode);
    }

    public async Task<int> CleanupDuplicatesAsync()
    {
        var allMatches = await _context.Matches.OrderBy(m => m.CreatedAt).ToListAsync();
        var seen = new HashSet<string>();
        var toRemove = new List<Match>();
        foreach (var m in allMatches)
        {
            var key = $"{m.CompetitionCode}|{m.HomeTeam}|{m.AwayTeam}|{m.Matchday}";
            if (!seen.Add(key))
                toRemove.Add(m);
        }
        _context.Matches.RemoveRange(toRemove);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Cleaned up {Count} duplicate matches", toRemove.Count);
        return toRemove.Count;
    }

    private HttpClient CreateClient()
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Auth-Token", _apiKey!);
        return client;
    }

    private static string MapStatus(string? apiStatus) => apiStatus switch
    {
        "SCHEDULED" or "TIMED" => "SCHEDULED",
        "IN_PLAY" or "LIVE" or "PAUSED" => "IN_PLAY",
        "FINISHED" => "FINISHED",
        "POSTPONED" => "POSTPONED",
        "CANCELLED" => "CANCELLED",
        _ => "SCHEDULED"
    };
}

public class FootballDataMatchesResponse
{
    [JsonPropertyName("competition")]
    public FdCompetition? Competition { get; set; }
    [JsonPropertyName("matches")]
    public List<FdMatch> Matches { get; set; } = [];
}

public class FdCompetition
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("code")]
    public string? Code { get; set; }
    [JsonPropertyName("type")]
    public string? Type { get; set; }
    [JsonPropertyName("area")]
    public FdArea? Area { get; set; }
}

public class FdArea
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }
}

public class FdMatch
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }
    [JsonPropertyName("matchday")]
    public int? Matchday { get; set; }
    [JsonPropertyName("utcDate")]
    public DateTime? UtcDate { get; set; }
    [JsonPropertyName("homeTeam")]
    public FdTeam? HomeTeam { get; set; }
    [JsonPropertyName("awayTeam")]
    public FdTeam? AwayTeam { get; set; }
    [JsonPropertyName("score")]
    public FdScore? Score { get; set; }
    [JsonPropertyName("season")]
    public FdSeason? Season { get; set; }
}

public class FdTeam
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("shortName")]
    public string? ShortName { get; set; }
    [JsonPropertyName("crest")]
    public string? Crest { get; set; }
}

public class FdScore
{
    [JsonPropertyName("fullTime")]
    public FdScoreDetail? FullTime { get; set; }
}

public class FdScoreDetail
{
    [JsonPropertyName("home")]
    public int? Home { get; set; }
    [JsonPropertyName("away")]
    public int? Away { get; set; }
}

public class FdSeason
{
    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }
}
