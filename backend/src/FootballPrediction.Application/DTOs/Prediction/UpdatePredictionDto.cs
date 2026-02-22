using System.Text.Json.Serialization;

namespace FootballPrediction.Application.DTOs.Prediction;

public class UpdatePredictionDto
{
    [JsonPropertyName("homeScore")]
    public int HomeScore { get; set; }

    [JsonPropertyName("awayScore")]
    public int AwayScore { get; set; }
}
