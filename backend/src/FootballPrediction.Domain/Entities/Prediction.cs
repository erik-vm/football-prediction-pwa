namespace FootballPrediction.Domain.Entities;

public class Prediction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MatchId { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public int? PointsEarned { get; set; }
    public string Status { get; set; } = "PENDING";
    public string CompetitionCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? User { get; set; }
    public Match? Match { get; set; }
}
