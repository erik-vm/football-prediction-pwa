namespace FootballPrediction.Domain.Entities;

public class GameWeek
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public Tournament Tournament { get; set; } = null!;
    public ICollection<Match> Matches { get; set; } = new List<Match>();
}
