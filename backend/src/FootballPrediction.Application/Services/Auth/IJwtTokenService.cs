using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Services.Auth;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
