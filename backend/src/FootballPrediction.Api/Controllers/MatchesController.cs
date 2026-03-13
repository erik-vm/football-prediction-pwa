using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Application.Services;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMatchRepository _repository;
    private readonly IMatchResultService _matchResultService;

    public MatchesController(IMatchRepository repository, IMatchResultService matchResultService)
    {
        _repository = repository;
        _matchResultService = matchResultService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Match>>> GetAll()
    {
        var matches = await _repository.GetAllAsync();
        return Ok(matches);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Match>> GetById(Guid id)
    {
        var match = await _repository.GetByIdAsync(id);
        if (match == null)
            return NotFound();

        return Ok(match);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<Match>>> GetUpcoming()
    {
        var matches = await _repository.GetUpcomingAsync();
        return Ok(matches);
    }

    [HttpGet("finished")]
    public async Task<ActionResult<IEnumerable<Match>>> GetFinished()
    {
        var matches = await _repository.GetFinishedAsync();
        return Ok(matches);
    }

    [HttpPost]
    public async Task<ActionResult<Match>> Create(Match match)
    {
        match.Id = Guid.NewGuid();
        var created = await _repository.AddAsync(match);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Match match)
    {
        if (id != match.Id)
            return BadRequest();

        await _repository.UpdateAsync(match);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _repository.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/result")]
    public async Task<IActionResult> SubmitResult(Guid id, [FromBody] MatchResultDto result)
    {
        await _matchResultService.ProcessMatchResultAsync(id, result.HomeScore, result.AwayScore);
        return Ok(new { message = "Result processed and predictions scored" });
    }
}

public class MatchResultDto
{
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
}
