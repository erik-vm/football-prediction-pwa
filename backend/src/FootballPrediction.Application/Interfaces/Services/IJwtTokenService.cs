using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces.Services;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
