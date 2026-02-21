using FootballPrediction.Domain.Enums;

namespace FootballPrediction.Application.DTOs.Match;

public class CreateMatchDto
{
    public Guid? GameWeekId { get; set; }
    public string HomeTeam { get; set; } = string.Empty;
    public string AwayTeam { get; set; } = string.Empty;
    public DateTime KickoffTime { get; set; }
    public TournamentStage Stage { get; set; }
}
