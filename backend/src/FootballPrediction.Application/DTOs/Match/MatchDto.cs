using FootballPrediction.Domain.Enums;

namespace FootballPrediction.Application.DTOs.Match;

public class MatchDto
{
    public Guid Id { get; set; }
    public Guid? GameWeekId { get; set; }
    public string HomeTeam { get; set; } = string.Empty;
    public string AwayTeam { get; set; } = string.Empty;
    public DateTime KickoffTime { get; set; }
    public TournamentStage Stage { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public bool IsFinished { get; set; }
    public int StageMultiplier { get; set; }
    public string CompetitionCode { get; set; } = string.Empty;
    public int? Matchday { get; set; }
}
