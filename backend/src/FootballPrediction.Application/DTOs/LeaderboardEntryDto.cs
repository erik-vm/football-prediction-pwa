namespace FootballPrediction.Application.DTOs;

public record LeaderboardEntryDto(
    Guid UserId, string Username, int TotalPoints,
    int TotalPredictions, double AveragePoints, double Accuracy, int Rank);
