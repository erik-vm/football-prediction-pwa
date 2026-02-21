namespace FootballPrediction.Domain.Entities;

public class UserCompetitionStats
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CompetitionCode { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int TotalPredictions { get; set; }
    public decimal Accuracy { get; set; }
    public int? Rank { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Competition Competition { get; set; } = null!;
}
