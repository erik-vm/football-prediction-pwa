using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/matches")]
public class MatchController : ControllerBase
{
    private readonly IMatchService _matchService;
    private readonly IMatchResultService _matchResultService;
    private readonly IFootballDataService _footballDataService;

    public MatchController(
        IMatchService matchService,
        IMatchResultService matchResultService,
        IFootballDataService footballDataService)
    {
        _matchService = matchService;
        _matchResultService = matchResultService;
        _footballDataService = footballDataService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _matchService.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _matchService.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcoming() => Ok(await _matchService.GetUpcomingAsync());

    [HttpGet("finished")]
    public async Task<IActionResult> GetFinished() => Ok(await _matchService.GetFinishedAsync());

    [HttpGet("filtered")]
    public async Task<IActionResult> GetFiltered([FromQuery] string? competitionCode, [FromQuery] int? matchday) =>
        Ok(await _matchService.GetFilteredAsync(competitionCode, matchday));

    [HttpGet("competitions")]
    public async Task<IActionResult> GetCompetitions() => Ok(await _matchService.GetCompetitionsAsync());

    [HttpGet("matchdays")]
    public async Task<IActionResult> GetMatchdays([FromQuery] string competitionCode) =>
        Ok(await _matchService.GetMatchdaysAsync(competitionCode));

    [HttpGet("nearest-matchday")]
    public async Task<IActionResult> GetNearestMatchday([FromQuery] string competitionCode, [FromQuery] string tab) =>
        Ok(await _matchService.GetNearestMatchdayAsync(competitionCode, tab));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MatchDto dto)
    {
        var result = await _matchService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MatchDto dto) =>
        await _matchService.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) =>
        await _matchService.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("sync")]
    public async Task<IActionResult> Sync()
    {
        await _footballDataService.SyncAllCompetitionsAsync();
        return Ok(new { message = "Sync completed" });
    }

    [HttpPost("cleanup-duplicates")]
    public async Task<IActionResult> CleanupDuplicates()
    {
        await _footballDataService.CleanupDuplicatesAsync();
        return Ok(new { message = "Cleanup completed" });
    }

    [HttpPost("{id:guid}/result")]
    public async Task<IActionResult> SetResult(Guid id, [FromBody] MatchResultRequest request)
    {
        var success = await _matchResultService.ProcessMatchResultAsync(id, request.HomeScore, request.AwayScore);
        return success ? Ok(new { message = "Result recorded and predictions scored" }) : NotFound();
    }
}
