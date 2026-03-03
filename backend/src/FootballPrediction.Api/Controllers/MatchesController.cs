using FluentValidation;
using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.DTOs.Match;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class MatchesController : ControllerBase
{
    private readonly IMatchRepository _matchRepository;
    private readonly IMatchResultService _matchResultService;
    private readonly IValidator<CreateMatchDto> _createValidator;
    private readonly IValidator<UpdateMatchDto> _updateValidator;
    private readonly IValidator<EnterMatchResultDto> _enterResultValidator;

    public MatchesController(
        IMatchRepository matchRepository,
        IMatchResultService matchResultService,
        IValidator<CreateMatchDto> createValidator,
        IValidator<UpdateMatchDto> updateValidator,
        IValidator<EnterMatchResultDto> enterResultValidator)
    {
        _matchRepository = matchRepository;
        _matchResultService = matchResultService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _enterResultValidator = enterResultValidator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IEnumerable<MatchDto>>>> GetMatches(
        [FromQuery] string? competitionCode = null,
        [FromQuery] bool? isFinished = null,
        [FromQuery] int? matchday = null)
    {
        var matches = await _matchRepository.GetFilteredAsync(competitionCode, isFinished, matchday);
        var matchDtos = matches.Select(m => new MatchDto
        {
            Id = m.Id,
            GameWeekId = m.GameWeekId,
            HomeTeam = m.HomeTeam,
            AwayTeam = m.AwayTeam,
            KickoffTime = m.KickoffTime,
            Stage = m.Stage,
            HomeScore = m.HomeScore,
            AwayScore = m.AwayScore,
            IsFinished = m.IsFinished,
            StageMultiplier = m.StageMultiplier,
            CompetitionCode = m.CompetitionCode,
            Matchday = m.Matchday,
            Venue = m.Venue
        }).ToList();

        return Ok(ApiResponse<IEnumerable<MatchDto>>.Success(matchDtos));
    }

    [HttpGet("gameweek/{gameWeekId}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<MatchDto>>> GetByGameWeekId(Guid gameWeekId)
    {
        var matches = await _matchRepository.GetByGameWeekIdAsync(gameWeekId);
        var matchDtos = matches.Select(m => new MatchDto
        {
            Id = m.Id,
            GameWeekId = m.GameWeekId,
            HomeTeam = m.HomeTeam,
            AwayTeam = m.AwayTeam,
            KickoffTime = m.KickoffTime,
            Stage = m.Stage,
            HomeScore = m.HomeScore,
            AwayScore = m.AwayScore,
            IsFinished = m.IsFinished,
            StageMultiplier = m.StageMultiplier,
            CompetitionCode = m.CompetitionCode,
            Matchday = m.Matchday,
            Venue = m.Venue
        });

        return Ok(matchDtos);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<MatchDto>>> GetById(Guid id)
    {
        var match = await _matchRepository.GetByIdAsync(id);
        if (match == null)
        {
            return NotFound(new { message = "Match not found" });
        }

        var matchDto = new MatchDto
        {
            Id = match.Id,
            GameWeekId = match.GameWeekId,
            HomeTeam = match.HomeTeam,
            AwayTeam = match.AwayTeam,
            KickoffTime = match.KickoffTime,
            Stage = match.Stage,
            HomeScore = match.HomeScore,
            AwayScore = match.AwayScore,
            IsFinished = match.IsFinished,
            StageMultiplier = match.StageMultiplier,
            CompetitionCode = match.CompetitionCode,
            Matchday = match.Matchday,
            Venue = match.Venue
        };

        return Ok(ApiResponse<MatchDto>.Success(matchDto));
    }

    [HttpGet("upcoming")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<MatchDto>>> GetUpcoming()
    {
        var matches = await _matchRepository.GetUpcomingAsync();
        var matchDtos = matches.Select(m => new MatchDto
        {
            Id = m.Id,
            GameWeekId = m.GameWeekId,
            HomeTeam = m.HomeTeam,
            AwayTeam = m.AwayTeam,
            KickoffTime = m.KickoffTime,
            Stage = m.Stage,
            HomeScore = m.HomeScore,
            AwayScore = m.AwayScore,
            IsFinished = m.IsFinished,
            StageMultiplier = m.StageMultiplier,
            CompetitionCode = m.CompetitionCode,
            Matchday = m.Matchday,
            Venue = m.Venue
        });

        return Ok(matchDtos);
    }

    [HttpGet("finished")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<MatchDto>>> GetFinished()
    {
        var matches = await _matchRepository.GetFinishedAsync();
        var matchDtos = matches.Select(m => new MatchDto
        {
            Id = m.Id,
            GameWeekId = m.GameWeekId,
            HomeTeam = m.HomeTeam,
            AwayTeam = m.AwayTeam,
            KickoffTime = m.KickoffTime,
            Stage = m.Stage,
            HomeScore = m.HomeScore,
            AwayScore = m.AwayScore,
            IsFinished = m.IsFinished,
            StageMultiplier = m.StageMultiplier,
            CompetitionCode = m.CompetitionCode,
            Matchday = m.Matchday,
            Venue = m.Venue
        });

        return Ok(matchDtos);
    }

    [HttpPost]
    public async Task<ActionResult<MatchDto>> Create([FromBody] CreateMatchDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var match = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = dto.GameWeekId,
            HomeTeam = dto.HomeTeam,
            AwayTeam = dto.AwayTeam,
            KickoffTime = dto.KickoffTime,
            Stage = dto.Stage,
            HomeScore = null,
            AwayScore = null,
            IsFinished = false
        };

        await _matchRepository.AddAsync(match);
        await _matchRepository.SaveChangesAsync();

        var matchDto = new MatchDto
        {
            Id = match.Id,
            GameWeekId = match.GameWeekId,
            HomeTeam = match.HomeTeam,
            AwayTeam = match.AwayTeam,
            KickoffTime = match.KickoffTime,
            Stage = match.Stage,
            HomeScore = match.HomeScore,
            AwayScore = match.AwayScore,
            IsFinished = match.IsFinished,
            StageMultiplier = match.StageMultiplier
        };

        return CreatedAtAction(nameof(GetById), new { id = match.Id }, matchDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MatchDto>> Update(Guid id, [FromBody] UpdateMatchDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var match = await _matchRepository.GetByIdAsync(id);
        if (match == null)
        {
            return NotFound(new { message = "Match not found" });
        }

        match.HomeTeam = dto.HomeTeam;
        match.AwayTeam = dto.AwayTeam;
        match.KickoffTime = dto.KickoffTime;
        match.Stage = dto.Stage;

        await _matchRepository.UpdateAsync(match);
        await _matchRepository.SaveChangesAsync();

        var matchDto = new MatchDto
        {
            Id = match.Id,
            GameWeekId = match.GameWeekId,
            HomeTeam = match.HomeTeam,
            AwayTeam = match.AwayTeam,
            KickoffTime = match.KickoffTime,
            Stage = match.Stage,
            HomeScore = match.HomeScore,
            AwayScore = match.AwayScore,
            IsFinished = match.IsFinished,
            StageMultiplier = match.StageMultiplier
        };

        return Ok(matchDto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var match = await _matchRepository.GetByIdAsync(id);
        if (match == null)
        {
            return NotFound(new { message = "Match not found" });
        }

        await _matchRepository.DeleteAsync(match);
        await _matchRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/result")]
    public async Task<ActionResult<MatchDto>> EnterResult(Guid id, [FromBody] EnterMatchResultDto dto)
    {
        var validationResult = await _enterResultValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        try
        {
            await _matchResultService.EnterResultAsync(id, dto.HomeScore, dto.AwayScore);

            var match = await _matchRepository.GetByIdAsync(id);
            var matchDto = new MatchDto
            {
                Id = match!.Id,
                GameWeekId = match.GameWeekId,
                HomeTeam = match.HomeTeam,
                AwayTeam = match.AwayTeam,
                KickoffTime = match.KickoffTime,
                Stage = match.Stage,
                HomeScore = match.HomeScore,
                AwayScore = match.AwayScore,
                IsFinished = match.IsFinished,
                StageMultiplier = match.StageMultiplier
            };

            return Ok(matchDto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
