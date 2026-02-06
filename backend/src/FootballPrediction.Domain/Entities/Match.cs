using FootballPrediction.Domain.Enums;

namespace FootballPrediction.Domain.Entities;

public class Match
{
    public Guid Id { get; set; }
    public Guid GameWeekId { get; set; }
    public required string HomeTeam { get; set; }
    public required string AwayTeam { get; set; }
    public DateTime KickoffTime { get; set; }
    public TournamentStage Stage { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public bool IsFinished { get; set; }

    public int StageMultiplier => Stage.GetMultiplier();

    public GameWeek GameWeek { get; set; } = null!;
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
