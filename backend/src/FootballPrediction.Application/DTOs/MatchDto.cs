namespace FootballPrediction.Application.DTOs;

public record MatchDto(
    Guid Id, Guid TournamentId, Guid? GameWeekId,
    string HomeTeam, string AwayTeam, DateTime KickoffTime,
    int? HomeScore, int? AwayScore, string Status,
    string CompetitionCode, string Season, int? Matchday, bool IsFinished);
