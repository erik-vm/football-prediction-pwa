using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.Services;
using FootballPrediction.Application.DTOs.Leaderboard;

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
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetOverallLeaderboard(Guid tournamentId)
    {
        var leaderboard = await _leaderboardService.GetOverallLeaderboardAsync(tournamentId);
        return Ok(leaderboard);
    }

    [HttpGet("competition/{competitionCode}")]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetByCompetition(string competitionCode)
    {
        var leaderboard = await _leaderboardService.GetByCompetitionAsync(competitionCode);
        return Ok(leaderboard);
    }
}
