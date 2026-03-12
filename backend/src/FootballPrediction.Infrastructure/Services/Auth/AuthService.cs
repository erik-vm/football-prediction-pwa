using BCrypt.Net;
using FootballPrediction.Application.DTOs.Auth;
using FootballPrediction.Application.Services.Auth;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(ApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException("User with this username already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
            IsAdmin = false,
            RefreshToken = _jwtTokenService.GenerateRefreshToken(),
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = user.RefreshToken,
            Username = user.Username,
            Email = user.Email,
            IsAdmin = user.IsAdmin
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        user.RefreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = user.RefreshToken,
            Username = user.Username,
            Email = user.Email,
            IsAdmin = user.IsAdmin
        };
    }

    public async Task<AuthResponse?> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user == null || user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            return null;
        }

        user.RefreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = user.RefreshToken,
            Username = user.Username,
            Email = user.Email,
            IsAdmin = user.IsAdmin
        };
    }
}
