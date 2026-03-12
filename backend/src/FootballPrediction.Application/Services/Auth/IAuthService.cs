using FootballPrediction.Application.DTOs.Auth;

namespace FootballPrediction.Application.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RefreshTokenAsync(RefreshTokenRequest request);
}
