using FootballPrediction.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserPreferencesController : ControllerBase
{
    private readonly IUserPreferenceRepository _preferenceRepository;

    public UserPreferencesController(IUserPreferenceRepository preferenceRepository)
    {
        _preferenceRepository = preferenceRepository;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return Guid.Parse(userIdClaim);
    }

    [HttpGet("me/preferences")]
    public async Task<IActionResult> GetUserPreferences()
    {
        var userId = GetCurrentUserId();
        var preferences = await _preferenceRepository.GetUserPreferencesAsync(userId);
        return Ok(preferences);
    }

    [HttpPost("me/preferences/competitions/{code}")]
    public async Task<IActionResult> AddCompetitionPreference(string code)
    {
        var userId = GetCurrentUserId();
        var preference = await _preferenceRepository.AddPreferenceAsync(userId, code);

        if (preference == null)
        {
            return BadRequest(new { message = "Failed to add preference" });
        }

        return Ok(preference);
    }

    [HttpDelete("me/preferences/competitions/{code}")]
    public async Task<IActionResult> RemoveCompetitionPreference(string code)
    {
        var userId = GetCurrentUserId();
        var removed = await _preferenceRepository.RemovePreferenceAsync(userId, code);

        if (!removed)
        {
            return NotFound(new { message = "Preference not found" });
        }

        return NoContent();
    }
}
