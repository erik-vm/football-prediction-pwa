namespace FootballPrediction.Application.DTOs.Prediction;

public class CreatePredictionDto
{
    public Guid MatchId { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
}
