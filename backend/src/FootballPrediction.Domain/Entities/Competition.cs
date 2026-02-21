namespace FootballPrediction.Domain.Entities;

public class Competition
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Emblem { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<Match> Matches { get; set; } = new List<Match>();
}
