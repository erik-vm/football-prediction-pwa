using FootballPrediction.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/leaderboard")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _service;

    public LeaderboardController(ILeaderboardService service)
    {
        _service = service;
    }

    [HttpGet("overall/{tournamentId:guid}")]
    public async Task<IActionResult> GetOverall(Guid tournamentId) =>
        Ok(await _service.GetOverallLeaderboardAsync(tournamentId));

    [HttpGet("competition/{competitionCode}")]
    public async Task<IActionResult> GetByCompetition(string competitionCode) =>
        Ok(await _service.GetByCompetitionAsync(competitionCode));
}
