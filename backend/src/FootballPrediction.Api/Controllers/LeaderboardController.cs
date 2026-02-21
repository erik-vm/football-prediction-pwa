using FootballPrediction.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;
    private readonly IUserCompetitionStatsRepository _statsRepository;

    public LeaderboardController(ILeaderboardService leaderboardService, IUserCompetitionStatsRepository statsRepository)
    {
        _leaderboardService = leaderboardService;
        _statsRepository = statsRepository;
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

    [HttpGet("competition/{competitionCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompetitionLeaderboard(string competitionCode, [FromQuery] int limit = 100)
    {
        var leaderboard = await _statsRepository.GetLeaderboardAsync(competitionCode, limit);
        return Ok(leaderboard);
    }

    [HttpGet("competition/{competitionCode}/user/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserCompetitionRank(string competitionCode, Guid userId)
    {
        var allStats = await _statsRepository.GetLeaderboardAsync(competitionCode, int.MaxValue);
        var userStats = allStats.FirstOrDefault(s => s.UserId == userId);

        if (userStats == null)
        {
            return NotFound(new { message = "User stats not found for this competition" });
        }

        return Ok(userStats);
    }
}
