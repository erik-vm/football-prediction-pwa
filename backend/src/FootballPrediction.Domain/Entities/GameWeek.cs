namespace FootballPrediction.Domain.Entities;

public class GameWeek
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Tournament? Tournament { get; set; }
    public ICollection<Match>? Matches { get; set; }
}
