namespace FootballPrediction.Domain.Entities;

public class UserCompetitionPreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CompetitionCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Competition Competition { get; set; } = null!;
}
