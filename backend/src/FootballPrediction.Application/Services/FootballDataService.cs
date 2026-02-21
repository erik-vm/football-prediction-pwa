using FootballPrediction.Application.DTOs.FootballData;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Domain.Enums;
using System.Net.Http.Json;
using System.Text.Json;

namespace FootballPrediction.Application.Services;

public class FootballDataService
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://api.football-data.org/v4";
    private const string ApiKey = "2c778464a60e4b51b2407fcc62539791";

    public FootballDataService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("X-Auth-Token", ApiKey);
    }

    public async Task<List<Match>> GetMatchesAsync(string competitionCode, DateTime dateFrom, DateTime dateTo)
    {
        var dateFromStr = dateFrom.ToString("yyyy-MM-dd");
        var dateToStr = dateTo.ToString("yyyy-MM-dd");
        var url = $"/competitions/{competitionCode}/matches?dateFrom={dateFromStr}&dateTo={dateToStr}";

        var response = await _httpClient.GetFromJsonAsync<FootballDataMatchesResponse>(url);

        if (response?.Matches == null)
            return new List<Match>();

        return response.Matches.Select(m => new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = Guid.Empty,
            HomeTeam = m.HomeTeam.Name,
            AwayTeam = m.AwayTeam.Name,
            KickoffTime = m.UtcDate,
            Stage = TournamentStage.GROUP_STAGE,
            HomeScore = m.Score?.FullTime?.Home,
            AwayScore = m.Score?.FullTime?.Away,
            IsFinished = m.Status == "FINISHED",
            CompetitionCode = competitionCode,
            Venue = m.Venue,
            Matchday = m.Matchday
        }).ToList();
    }

    public async Task<List<Competition>> GetActiveCompetitionsAsync()
    {
        var competitions = new List<Competition>
        {
            new Competition { Code = "PL", Name = "Premier League", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "CL", Name = "Champions League", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "BL1", Name = "Bundesliga", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "SA", Name = "Serie A", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "PD", Name = "La Liga", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "FL1", Name = "Ligue 1", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "DED", Name = "Eredivisie", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "PPL", Name = "Primeira Liga", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "ELC", Name = "Championship", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "BSA", Name = "Brasileirão", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "WC", Name = "World Cup", IsActive = false, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "EC", Name = "European Championship", IsActive = false, CreatedAt = DateTime.UtcNow }
        };

        return await Task.FromResult(competitions);
    }
}
