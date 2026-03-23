using System.Security.Claims;
using FluentValidation;
using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/predictions")]
[Authorize]
public class PredictionController : ControllerBase
{
    private readonly IPredictionService _service;
    private readonly IValidator<PredictionRequest> _validator;

    public PredictionController(IPredictionService service, IValidator<PredictionRequest> validator)
    {
        _service = service;
        _validator = validator;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMy([FromQuery] Guid? userId)
    {
        var id = userId ?? GetUserId();
        return Ok(await _service.GetByUserAsync(id));
    }

    [HttpGet("match/{matchId:guid}")]
    public async Task<IActionResult> GetByMatch(Guid matchId)
    {
        var result = await _service.GetByMatchAndUserAsync(matchId, GetUserId());
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PredictionRequest request)
    {
        var validation = await _validator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        var result = await _service.CreateAsync(GetUserId(), request);
        if (result == null)
            return Conflict(new { message = "Prediction already exists or match has started" });

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PredictionRequest request)
    {
        var validation = await _validator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });

        return await _service.UpdateAsync(id, GetUserId(), request) ? NoContent() : BadRequest();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) =>
        await _service.DeleteAsync(id, GetUserId()) ? NoContent() : BadRequest();
}
