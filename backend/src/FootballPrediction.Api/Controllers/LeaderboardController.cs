using FootballPrediction.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    [HttpGet("overall/{tournamentId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOverallLeaderboard(Guid tournamentId)
    {
        var leaderboard = await _leaderboardService.GetOverallLeaderboardAsync(tournamentId);
        return Ok(leaderboard);
    }

    [HttpGet("weekly/{gameWeekId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetWeeklyLeaderboard(Guid gameWeekId)
    {
        var leaderboard = await _leaderboardService.GetWeeklyLeaderboardAsync(gameWeekId);
        return Ok(leaderboard);
    }

    [HttpPost("weekly/{gameWeekId}/calculate-bonuses")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CalculateWeeklyBonuses(Guid gameWeekId)
    {
        await _leaderboardService.CalculateAndApplyWeeklyBonusesAsync(gameWeekId);
        return Ok(new { message = "Weekly bonuses calculated and applied successfully" });
    }
}
