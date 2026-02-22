using System.Text.Json.Serialization;

namespace FootballPrediction.Application.DTOs.Prediction;

public class CreatePredictionDto
{
    public Guid MatchId { get; set; }

    [JsonPropertyName("homeScore")]
    public int HomeScore { get; set; }

    [JsonPropertyName("awayScore")]
    public int AwayScore { get; set; }
}
