using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TournamentsController : ControllerBase
{
    private readonly ITournamentRepository _repository;

    public TournamentsController(ITournamentRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tournament>>> GetAll()
    {
        var tournaments = await _repository.GetAllAsync();
        return Ok(tournaments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Tournament>> GetById(Guid id)
    {
        var tournament = await _repository.GetByIdAsync(id);
        if (tournament == null)
            return NotFound();

        return Ok(tournament);
    }

    [HttpPost]
    public async Task<ActionResult<Tournament>> Create(Tournament tournament)
    {
        tournament.Id = Guid.NewGuid();
        var created = await _repository.AddAsync(tournament);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Tournament tournament)
    {
        if (id != tournament.Id)
            return BadRequest();

        await _repository.UpdateAsync(tournament);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _repository.DeleteAsync(id);
        return NoContent();
    }
}
