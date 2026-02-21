namespace FootballPrediction.Domain.Entities;

public class WeeklyBonus
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GameWeekId { get; set; }
    public int BonusPoints { get; set; }
    public DateTime AwardedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public GameWeek GameWeek { get; set; } = null!;
}
