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

    public async Task<IEnumerable<Prediction>> GetByMatchIdAsync(Guid matchId)
    {
        return await _context.Predictions
            .Where(p => p.MatchId == matchId)
            .ToListAsync();
    }

    public async Task UpdateAsync(Prediction prediction)
    {
        _context.Predictions.Update(prediction);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
