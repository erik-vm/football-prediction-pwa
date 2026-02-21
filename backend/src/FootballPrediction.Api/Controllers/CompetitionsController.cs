using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.DTOs.Competition;
using FootballPrediction.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompetitionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CompetitionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CompetitionDto>>>> GetCompetitions([FromQuery] bool? activeOnly = null)
    {
        var query = _context.Competitions.AsQueryable();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(c => c.IsActive);
        }

        var competitions = await query
            .Select(c => new CompetitionDto
            {
                Code = c.Code,
                Name = c.Name,
                Emblem = c.Emblem,
                IsActive = c.IsActive
            })
            .OrderBy(c => c.Name)
            .ToListAsync();

        return ApiResponse<List<CompetitionDto>>.Success(competitions);
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<ApiResponse<CompetitionDto>>> GetCompetition(string code)
    {
        var competition = await _context.Competitions
            .Where(c => c.Code == code)
            .Select(c => new CompetitionDto
            {
                Code = c.Code,
                Name = c.Name,
                Emblem = c.Emblem,
                IsActive = c.IsActive
            })
            .FirstOrDefaultAsync();

        if (competition == null)
        {
            return NotFound(ApiResponse<CompetitionDto>.Error($"Competition with code '{code}' not found."));
        }

        return ApiResponse<CompetitionDto>.Success(competition);
    }
}
