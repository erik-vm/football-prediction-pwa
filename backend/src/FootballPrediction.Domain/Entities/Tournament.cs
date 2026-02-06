namespace FootballPrediction.Domain.Entities;

public class Tournament
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Season { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }

    public ICollection<GameWeek> GameWeeks { get; set; } = new List<GameWeek>();
}
