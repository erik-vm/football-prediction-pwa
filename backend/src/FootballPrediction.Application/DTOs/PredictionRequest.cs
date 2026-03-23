namespace FootballPrediction.Application.DTOs;

public record PredictionRequest(Guid? UserId, Guid MatchId, int HomeScore, int AwayScore);
