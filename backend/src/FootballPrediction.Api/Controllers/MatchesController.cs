using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMatchRepository _repository;

    public MatchesController(IMatchRepository repository)
    {
        _repository = repository;
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
}
