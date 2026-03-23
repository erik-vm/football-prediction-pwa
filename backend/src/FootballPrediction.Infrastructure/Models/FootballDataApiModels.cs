using System.Text.Json.Serialization;

namespace FootballPrediction.Infrastructure.Models;

public class CompetitionMatchesResponse
{
    [JsonPropertyName("competition")]
    public CompetitionInfo? Competition { get; set; }

    [JsonPropertyName("matches")]
    public List<ApiMatch>? Matches { get; set; }
}

public class CompetitionInfo
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("emblem")]
    public string? Emblem { get; set; }
}

public class ApiMatch
{
    [JsonPropertyName("homeTeam")]
    public ApiTeam? HomeTeam { get; set; }

    [JsonPropertyName("awayTeam")]
    public ApiTeam? AwayTeam { get; set; }

    [JsonPropertyName("utcDate")]
    public DateTime UtcDate { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("matchday")]
    public int? Matchday { get; set; }

    [JsonPropertyName("score")]
    public ApiScore? Score { get; set; }

    [JsonPropertyName("season")]
    public ApiSeason? Season { get; set; }
}

public class ApiTeam
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class ApiScore
{
    [JsonPropertyName("fullTime")]
    public ApiScoreDetail? FullTime { get; set; }
}

public class ApiScoreDetail
{
    [JsonPropertyName("home")]
    public int? Home { get; set; }

    [JsonPropertyName("away")]
    public int? Away { get; set; }
}

public class ApiSeason
{
    [JsonPropertyName("startDate")]
    public string StartDate { get; set; } = string.Empty;

    [JsonPropertyName("endDate")]
    public string EndDate { get; set; } = string.Empty;
}
