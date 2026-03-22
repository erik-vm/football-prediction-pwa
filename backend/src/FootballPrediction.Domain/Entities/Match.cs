namespace FootballPrediction.Domain.Entities;

public class Match
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public Guid? GameWeekId { get; set; }
    public string HomeTeam { get; set; } = string.Empty;
    public string AwayTeam { get; set; } = string.Empty;
    public DateTime KickoffTime { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string Status { get; set; } = "SCHEDULED";
    public string CompetitionCode { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public int? Matchday { get; set; }
    public bool IsFinished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Tournament? Tournament { get; set; }
    public GameWeek? GameWeek { get; set; }
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
