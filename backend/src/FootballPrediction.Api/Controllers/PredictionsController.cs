using System.Security.Claims;
using FluentValidation;
using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.DTOs.Prediction;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PredictionsController : ControllerBase
{
    private readonly IPredictionRepository _predictionRepository;
    private readonly IMatchRepository _matchRepository;
    private readonly IValidator<CreatePredictionDto> _createValidator;
    private readonly IValidator<UpdatePredictionDto> _updateValidator;

    public PredictionsController(
        IPredictionRepository predictionRepository,
        IMatchRepository matchRepository,
        IValidator<CreatePredictionDto> createValidator,
        IValidator<UpdatePredictionDto> updateValidator)
    {
        _predictionRepository = predictionRepository;
        _matchRepository = matchRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PredictionDto>>> CreatePrediction([FromBody] CreatePredictionDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized("User ID not found in token");
        }

        var match = await _matchRepository.GetByIdAsync(dto.MatchId);
        if (match == null)
        {
            return NotFound("Match not found");
        }

        if (match.KickoffTime <= DateTime.UtcNow)
        {
            return BadRequest("Cannot create prediction after match kickoff");
        }

        if (match.IsFinished)
        {
            return BadRequest("Cannot create prediction for finished match");
        }

        var existingPrediction = await _predictionRepository.GetByUserAndMatchAsync(userId, dto.MatchId);
        if (existingPrediction != null)
        {
            return Conflict("Prediction already exists for this match. Use PUT to update.");
        }

        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MatchId = dto.MatchId,
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            CompetitionCode = match.CompetitionCode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _predictionRepository.CreateAsync(prediction);
        await _predictionRepository.SaveChangesAsync();

        var createdPrediction = await _predictionRepository.GetByIdAsync(prediction.Id);
        return CreatedAtAction(nameof(GetById), new { id = prediction.Id }, ApiResponse<PredictionDto>.Success(MapToPredictionDto(createdPrediction!)));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PredictionDto>>> GetById(Guid id)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null)
        {
            return NotFound("Prediction not found");
        }

        var userId = GetUserId();
        if (prediction.UserId != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        return Ok(ApiResponse<PredictionDto>.Success(MapToPredictionDto(prediction)));
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PredictionDto>>>> GetMyPredictions()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized("User ID not found in token");
        }

        var predictions = await _predictionRepository.GetByUserIdAsync(userId);
        var predictionDtos = predictions.Select(MapToPredictionDto).ToList();

        return Ok(ApiResponse<IEnumerable<PredictionDto>>.Success(predictionDtos));
    }

    [HttpGet("match/{matchId}")]
    public async Task<ActionResult<ApiResponse<PredictionDto>>> GetByMatch(Guid matchId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized("User ID not found in token");
        }

        var prediction = await _predictionRepository.GetByUserAndMatchAsync(userId, matchId);
        if (prediction == null)
        {
            return NotFound("No prediction found for this match");
        }

        return Ok(ApiResponse<PredictionDto>.Success(MapToPredictionDto(prediction)));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PredictionDto>>> UpdatePrediction(Guid id, [FromBody] UpdatePredictionDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null)
        {
            return NotFound("Prediction not found");
        }

        var userId = GetUserId();
        if (prediction.UserId != userId)
        {
            return Forbid();
        }

        if (prediction.Match.KickoffTime <= DateTime.UtcNow)
        {
            return BadRequest("Cannot update prediction after match kickoff");
        }

        if (prediction.Match.IsFinished)
        {
            return BadRequest("Cannot update prediction for finished match");
        }

        prediction.HomeScore = dto.HomeScore;
        prediction.AwayScore = dto.AwayScore;

        await _predictionRepository.UpdateAsync(prediction);
        await _predictionRepository.SaveChangesAsync();

        var updatedPrediction = await _predictionRepository.GetByIdAsync(id);
        return Ok(ApiResponse<PredictionDto>.Success(MapToPredictionDto(updatedPrediction!)));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePrediction(Guid id)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null)
        {
            return NotFound("Prediction not found");
        }

        var userId = GetUserId();
        if (prediction.UserId != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        if (prediction.Match.KickoffTime <= DateTime.UtcNow)
        {
            return BadRequest("Cannot delete prediction after match kickoff");
        }

        await _predictionRepository.DeleteAsync(prediction);
        await _predictionRepository.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
    }

    private PredictionDto MapToPredictionDto(Prediction prediction)
    {
        return new PredictionDto
        {
            Id = prediction.Id,
            UserId = prediction.UserId,
            MatchId = prediction.MatchId,
            MatchDescription = $"{prediction.Match.HomeTeam} vs {prediction.Match.AwayTeam}",
            KickoffTime = prediction.Match.KickoffTime,
            HomeScore = prediction.HomeScore,
            AwayScore = prediction.AwayScore,
            PointsEarned = prediction.PointsEarned,
            IsMatchFinished = prediction.Match.IsFinished,
            ActualHomeScore = prediction.Match.HomeScore,
            ActualAwayScore = prediction.Match.AwayScore,
            CreatedAt = prediction.CreatedAt,
            UpdatedAt = prediction.UpdatedAt
        };
    }
}
