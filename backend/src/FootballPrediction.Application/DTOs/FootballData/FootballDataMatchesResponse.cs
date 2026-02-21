using System.Text.Json.Serialization;

namespace FootballPrediction.Application.DTOs.FootballData;

public class FootballDataMatchesResponse
{
    [JsonPropertyName("matches")]
    public List<FootballDataMatch> Matches { get; set; } = new();
}

public class FootballDataMatch
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("utcDate")]
    public DateTime UtcDate { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("matchday")]
    public int? Matchday { get; set; }

    [JsonPropertyName("venue")]
    public string? Venue { get; set; }

    [JsonPropertyName("homeTeam")]
    public FootballDataTeam HomeTeam { get; set; } = new();

    [JsonPropertyName("awayTeam")]
    public FootballDataTeam AwayTeam { get; set; } = new();

    [JsonPropertyName("score")]
    public FootballDataScore? Score { get; set; }
}

public class FootballDataTeam
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class FootballDataScore
{
    [JsonPropertyName("fullTime")]
    public FootballDataScoreDetail? FullTime { get; set; }
}

public class FootballDataScoreDetail
{
    [JsonPropertyName("home")]
    public int? Home { get; set; }

    [JsonPropertyName("away")]
    public int? Away { get; set; }
}
