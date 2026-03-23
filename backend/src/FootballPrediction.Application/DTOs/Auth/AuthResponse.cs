namespace FootballPrediction.Application.DTOs.Auth;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    Guid UserId,
    string Username,
    string Email,
    bool IsAdmin);
