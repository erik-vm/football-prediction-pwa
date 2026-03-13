using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PredictionsController : ControllerBase
{
    private readonly IPredictionRepository _predictionRepository;
    private readonly IMatchRepository _matchRepository;

    public PredictionsController(IPredictionRepository predictionRepository, IMatchRepository matchRepository)
    {
        _predictionRepository = predictionRepository;
        _matchRepository = matchRepository;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Prediction>> GetById(Guid id)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null)
            return NotFound();

        return Ok(prediction);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<Prediction>>> GetMyPredictions([FromQuery] Guid userId)
    {
        var predictions = await _predictionRepository.GetByUserIdAsync(userId);
        return Ok(predictions);
    }

    [HttpPost]
    public async Task<ActionResult<Prediction>> Create(Prediction prediction)
    {
        var match = await _matchRepository.GetByIdAsync(prediction.MatchId);
        if (match == null)
            return BadRequest("Match not found");

        if (match.KickoffTime <= DateTime.UtcNow)
            return BadRequest("Cannot predict after kickoff");

        var existing = await _predictionRepository.GetByUserAndMatchAsync(prediction.UserId, prediction.MatchId);
        if (existing != null)
            return Conflict("Prediction already exists for this match");

        prediction.Id = Guid.NewGuid();
        prediction.Status = "PENDING";
        var created = await _predictionRepository.AddAsync(prediction);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Prediction prediction)
    {
        if (id != prediction.Id)
            return BadRequest();

        var match = await _matchRepository.GetByIdAsync(prediction.MatchId);
        if (match == null || match.KickoffTime <= DateTime.UtcNow)
            return BadRequest("Cannot update after kickoff");

        await _predictionRepository.UpdateAsync(prediction);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null)
            return NotFound();

        var match = await _matchRepository.GetByIdAsync(prediction.MatchId);
        if (match == null || match.KickoffTime <= DateTime.UtcNow)
            return BadRequest("Cannot delete after kickoff");

        await _predictionRepository.DeleteAsync(id);
        return NoContent();
    }
}
