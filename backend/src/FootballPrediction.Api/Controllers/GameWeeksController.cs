using FluentValidation;
using FootballPrediction.Application.DTOs.GameWeek;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class GameWeeksController : ControllerBase
{
    private readonly IGameWeekRepository _gameWeekRepository;
    private readonly IValidator<CreateGameWeekDto> _createValidator;
    private readonly IValidator<UpdateGameWeekDto> _updateValidator;

    public GameWeeksController(
        IGameWeekRepository gameWeekRepository,
        IValidator<CreateGameWeekDto> createValidator,
        IValidator<UpdateGameWeekDto> updateValidator)
    {
        _gameWeekRepository = gameWeekRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet("tournament/{tournamentId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<GameWeekDto>>> GetByTournamentId(Guid tournamentId)
    {
        var gameWeeks = await _gameWeekRepository.GetByTournamentIdAsync(tournamentId);
        var gameWeekDtos = gameWeeks.Select(gw => new GameWeekDto
        {
            Id = gw.Id,
            TournamentId = gw.TournamentId,
            WeekNumber = gw.WeekNumber,
            StartDate = gw.StartDate,
            EndDate = gw.EndDate
        });

        return Ok(gameWeekDtos);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<GameWeekDto>> GetById(Guid id)
    {
        var gameWeek = await _gameWeekRepository.GetByIdAsync(id);
        if (gameWeek == null)
        {
            return NotFound(new { message = "Game week not found" });
        }

        var gameWeekDto = new GameWeekDto
        {
            Id = gameWeek.Id,
            TournamentId = gameWeek.TournamentId,
            WeekNumber = gameWeek.WeekNumber,
            StartDate = gameWeek.StartDate,
            EndDate = gameWeek.EndDate
        };

        return Ok(gameWeekDto);
    }

    [HttpPost]
    public async Task<ActionResult<GameWeekDto>> Create([FromBody] CreateGameWeekDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var gameWeek = new GameWeek
        {
            Id = Guid.NewGuid(),
            TournamentId = dto.TournamentId,
            WeekNumber = dto.WeekNumber,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        await _gameWeekRepository.AddAsync(gameWeek);
        await _gameWeekRepository.SaveChangesAsync();

        var gameWeekDto = new GameWeekDto
        {
            Id = gameWeek.Id,
            TournamentId = gameWeek.TournamentId,
            WeekNumber = gameWeek.WeekNumber,
            StartDate = gameWeek.StartDate,
            EndDate = gameWeek.EndDate
        };

        return CreatedAtAction(nameof(GetById), new { id = gameWeek.Id }, gameWeekDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GameWeekDto>> Update(Guid id, [FromBody] UpdateGameWeekDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var gameWeek = await _gameWeekRepository.GetByIdAsync(id);
        if (gameWeek == null)
        {
            return NotFound(new { message = "Game week not found" });
        }

        gameWeek.WeekNumber = dto.WeekNumber;
        gameWeek.StartDate = dto.StartDate;
        gameWeek.EndDate = dto.EndDate;

        await _gameWeekRepository.UpdateAsync(gameWeek);
        await _gameWeekRepository.SaveChangesAsync();

        var gameWeekDto = new GameWeekDto
        {
            Id = gameWeek.Id,
            TournamentId = gameWeek.TournamentId,
            WeekNumber = gameWeek.WeekNumber,
            StartDate = gameWeek.StartDate,
            EndDate = gameWeek.EndDate
        };

        return Ok(gameWeekDto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var gameWeek = await _gameWeekRepository.GetByIdAsync(id);
        if (gameWeek == null)
        {
            return NotFound(new { message = "Game week not found" });
        }

        await _gameWeekRepository.DeleteAsync(gameWeek);
        await _gameWeekRepository.SaveChangesAsync();

        return NoContent();
    }
}
