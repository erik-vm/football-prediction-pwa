namespace FootballPrediction.Application.DTOs;

public record PredictionDto(
    Guid Id, Guid UserId, Guid MatchId,
    int HomeScore, int AwayScore, int? PointsEarned,
    string Status, string CompetitionCode,
    DateTime CreatedAt, DateTime UpdatedAt,
    MatchDto? Match = null);
