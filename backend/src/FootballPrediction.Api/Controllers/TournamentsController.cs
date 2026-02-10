using FluentValidation;
using FootballPrediction.Application.DTOs.Tournament;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin")]
public class TournamentsController : ControllerBase
{
    private readonly ITournamentRepository _tournamentRepository;
    private readonly IValidator<CreateTournamentDto> _createValidator;
    private readonly IValidator<UpdateTournamentDto> _updateValidator;

    public TournamentsController(
        ITournamentRepository tournamentRepository,
        IValidator<CreateTournamentDto> createValidator,
        IValidator<UpdateTournamentDto> updateValidator)
    {
        _tournamentRepository = tournamentRepository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TournamentDto>>> GetAll()
    {
        var tournaments = await _tournamentRepository.GetAllAsync();
        var tournamentDtos = tournaments.Select(t => new TournamentDto
        {
            Id = t.Id,
            Name = t.Name,
            Season = t.Season,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            IsActive = t.IsActive
        });

        return Ok(tournamentDtos);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<TournamentDto>> GetById(Guid id)
    {
        var tournament = await _tournamentRepository.GetByIdAsync(id);
        if (tournament == null)
        {
            return NotFound(new { message = "Tournament not found" });
        }

        var tournamentDto = new TournamentDto
        {
            Id = tournament.Id,
            Name = tournament.Name,
            Season = tournament.Season,
            StartDate = tournament.StartDate,
            EndDate = tournament.EndDate,
            IsActive = tournament.IsActive
        };

        return Ok(tournamentDto);
    }

    [HttpPost]
    public async Task<ActionResult<TournamentDto>> Create([FromBody] CreateTournamentDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var tournament = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Season = dto.Season,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive
        };

        await _tournamentRepository.AddAsync(tournament);
        await _tournamentRepository.SaveChangesAsync();

        var tournamentDto = new TournamentDto
        {
            Id = tournament.Id,
            Name = tournament.Name,
            Season = tournament.Season,
            StartDate = tournament.StartDate,
            EndDate = tournament.EndDate,
            IsActive = tournament.IsActive
        };

        return CreatedAtAction(nameof(GetById), new { id = tournament.Id }, tournamentDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TournamentDto>> Update(Guid id, [FromBody] UpdateTournamentDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var tournament = await _tournamentRepository.GetByIdAsync(id);
        if (tournament == null)
        {
            return NotFound(new { message = "Tournament not found" });
        }

        tournament.Name = dto.Name;
        tournament.Season = dto.Season;
        tournament.StartDate = dto.StartDate;
        tournament.EndDate = dto.EndDate;
        tournament.IsActive = dto.IsActive;

        await _tournamentRepository.UpdateAsync(tournament);
        await _tournamentRepository.SaveChangesAsync();

        var tournamentDto = new TournamentDto
        {
            Id = tournament.Id,
            Name = tournament.Name,
            Season = tournament.Season,
            StartDate = tournament.StartDate,
            EndDate = tournament.EndDate,
            IsActive = tournament.IsActive
        };

        return Ok(tournamentDto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var tournament = await _tournamentRepository.GetByIdAsync(id);
        if (tournament == null)
        {
            return NotFound(new { message = "Tournament not found" });
        }

        await _tournamentRepository.DeleteAsync(tournament);
        await _tournamentRepository.SaveChangesAsync();

        return NoContent();
    }
}
