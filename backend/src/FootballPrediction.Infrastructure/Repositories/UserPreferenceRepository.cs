using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class UserPreferenceRepository : IUserPreferenceRepository
{
    private readonly ApplicationDbContext _context;

    public UserPreferenceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserCompetitionPreference>> GetUserPreferencesAsync(Guid userId)
    {
        return await _context.UserCompetitionPreferences
            .Include(p => p.Competition)
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<UserCompetitionPreference?> AddPreferenceAsync(Guid userId, string competitionCode)
    {
        var existing = await _context.UserCompetitionPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId && p.CompetitionCode == competitionCode);

        if (existing != null)
        {
            return existing;
        }

        var preference = new UserCompetitionPreference
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CompetitionCode = competitionCode,
            CreatedAt = DateTime.UtcNow
        };

        await _context.UserCompetitionPreferences.AddAsync(preference);
        await _context.SaveChangesAsync();

        return await _context.UserCompetitionPreferences
            .Include(p => p.Competition)
            .FirstOrDefaultAsync(p => p.Id == preference.Id);
    }

    public async Task<bool> RemovePreferenceAsync(Guid userId, string competitionCode)
    {
        var preference = await _context.UserCompetitionPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId && p.CompetitionCode == competitionCode);

        if (preference == null)
        {
            return false;
        }

        _context.UserCompetitionPreferences.Remove(preference);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> HasPreferenceAsync(Guid userId, string competitionCode)
    {
        return await _context.UserCompetitionPreferences
            .AnyAsync(p => p.UserId == userId && p.CompetitionCode == competitionCode);
    }
}
