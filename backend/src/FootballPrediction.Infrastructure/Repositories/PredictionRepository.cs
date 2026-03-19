using Microsoft.EntityFrameworkCore;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;

namespace FootballPrediction.Infrastructure.Repositories;

public class PredictionRepository : IPredictionRepository
{
    private readonly ApplicationDbContext _context;

    public PredictionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Prediction>> GetAllAsync()
    {
        return await _context.Predictions
            .Include(p => p.User)
            .Include(p => p.Match)
            .ToListAsync();
    }

    public async Task<Prediction?> GetByIdAsync(Guid id)
    {
        return await _context.Predictions
            .Include(p => p.User)
            .Include(p => p.Match)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Prediction>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Predictions
            .Where(p => p.UserId == userId)
            .Include(p => p.Match)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Prediction>> GetByMatchIdAsync(Guid matchId)
    {
        return await _context.Predictions
            .Where(p => p.MatchId == matchId)
            .Include(p => p.User)
            .ToListAsync();
    }

    public async Task<Prediction?> GetByUserAndMatchAsync(Guid userId, Guid matchId)
    {
        return await _context.Predictions
            .FirstOrDefaultAsync(p => p.UserId == userId && p.MatchId == matchId);
    }

    public async Task<Prediction> AddAsync(Prediction prediction)
    {
        _context.Predictions.Add(prediction);
        await _context.SaveChangesAsync();
        return prediction;
    }

    public async Task UpdateAsync(Prediction prediction)
    {
        _context.Predictions.Update(prediction);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var prediction = await GetByIdAsync(id);
        if (prediction != null)
        {
            _context.Predictions.Remove(prediction);
            await _context.SaveChangesAsync();
        }
    }
}
