using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class PredictionRepository : IPredictionRepository
{
    private readonly ApplicationDbContext _context;

    public PredictionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Prediction?> GetByIdAsync(Guid id)
    {
        return await _context.Predictions
            .Include(p => p.Match)
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Prediction?> GetByUserAndMatchAsync(Guid userId, Guid matchId)
    {
        return await _context.Predictions
            .Include(p => p.Match)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.MatchId == matchId);
    }

    public async Task<IEnumerable<Prediction>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Predictions
            .Include(p => p.Match)
                .ThenInclude(m => m.GameWeek)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.Match.KickoffTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Prediction>> GetByMatchIdAsync(Guid matchId)
    {
        return await _context.Predictions
            .Where(p => p.MatchId == matchId)
            .ToListAsync();
    }

    public async Task<Prediction> CreateAsync(Prediction prediction)
    {
        await _context.Predictions.AddAsync(prediction);
        return prediction;
    }

    public async Task UpdateAsync(Prediction prediction)
    {
        prediction.UpdatedAt = DateTime.UtcNow;
        _context.Predictions.Update(prediction);
    }

    public async Task DeleteAsync(Prediction prediction)
    {
        _context.Predictions.Remove(prediction);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
