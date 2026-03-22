using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Authorize]
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
    public async Task<ActionResult<IEnumerable<Prediction>>> GetMyPredictions([FromQuery] Guid? userId)
    {
        var uid = GetUserId() ?? userId ?? Guid.Empty;
        if (uid == Guid.Empty)
            return BadRequest("User ID required");

        var predictions = await _predictionRepository.GetByUserIdAsync(uid);
        return Ok(predictions);
    }

    [HttpGet("match/{matchId}")]
    public async Task<ActionResult<Prediction>> GetByMatch(Guid matchId)
    {
        var uid = GetUserId();
        if (uid == null)
            return Unauthorized();

        var prediction = await _predictionRepository.GetByUserAndMatchAsync(uid.Value, matchId);
        if (prediction == null)
            return NotFound();

        return Ok(prediction);
    }

    [HttpPost]
    public async Task<ActionResult<Prediction>> Create(Prediction prediction)
    {
        var uid = GetUserId() ?? prediction.UserId;
        if (uid == Guid.Empty)
            return BadRequest("User ID required");

        prediction.UserId = uid;

        var match = await _matchRepository.GetByIdAsync(prediction.MatchId);
        if (match == null)
            return BadRequest("Match not found");

        if (match.KickoffTime <= DateTime.UtcNow)
            return BadRequest("Cannot predict after kickoff");

        var existing = await _predictionRepository.GetByUserAndMatchAsync(uid, prediction.MatchId);
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
        var existing = await _predictionRepository.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        var match = await _matchRepository.GetByIdAsync(existing.MatchId);
        if (match == null || match.KickoffTime <= DateTime.UtcNow)
            return BadRequest("Cannot update after kickoff");

        existing.HomeScore = prediction.HomeScore;
        existing.AwayScore = prediction.AwayScore;
        await _predictionRepository.UpdateAsync(existing);
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

    private Guid? GetUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
