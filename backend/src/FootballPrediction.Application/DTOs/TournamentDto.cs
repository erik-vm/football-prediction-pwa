namespace FootballPrediction.Application.DTOs;

public record TournamentDto(
    Guid Id, string Name, string Code, string Season,
    DateTime StartDate, DateTime EndDate,
    string? Country, string? Type, string? LogoUrl);
