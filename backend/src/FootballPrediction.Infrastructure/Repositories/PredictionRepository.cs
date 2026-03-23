using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class PredictionRepository : Repository<Prediction>, IPredictionRepository
{
    public PredictionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Prediction>> GetByUserAsync(Guid userId) =>
        await DbSet.AsNoTracking()
            .Include(p => p.Match)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<Prediction?> GetByMatchAndUserAsync(Guid matchId, Guid userId) =>
        await DbSet.FirstOrDefaultAsync(p => p.MatchId == matchId && p.UserId == userId);

    public async Task<IEnumerable<Prediction>> GetPendingByMatchAsync(Guid matchId) =>
        await DbSet.Where(p => p.MatchId == matchId && p.Status == "PENDING").ToListAsync();

    public async Task<IEnumerable<Prediction>> GetScoredByCompetitionAsync(string competitionCode) =>
        await DbSet.AsNoTracking()
            .Include(p => p.User)
            .Where(p => p.Status == "SCORED" && p.CompetitionCode == competitionCode)
            .ToListAsync();

    public async Task<IEnumerable<Prediction>> GetScoredByTournamentAsync(Guid tournamentId) =>
        await DbSet.AsNoTracking()
            .Include(p => p.User)
            .Include(p => p.Match)
            .Where(p => p.Status == "SCORED" && p.Match != null && p.Match.TournamentId == tournamentId)
            .ToListAsync();
}
