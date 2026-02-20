namespace FootballPrediction.Application.DTOs.Prediction;

public class PredictionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MatchId { get; set; }
    public string MatchDescription { get; set; } = string.Empty;
    public DateTime KickoffTime { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public int? PointsEarned { get; set; }
    public bool IsMatchFinished { get; set; }
    public int? ActualHomeScore { get; set; }
    public int? ActualAwayScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
