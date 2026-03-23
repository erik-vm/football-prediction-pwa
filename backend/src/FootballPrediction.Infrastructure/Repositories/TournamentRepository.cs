using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class TournamentRepository : Repository<Tournament>, ITournamentRepository
{
    public TournamentRepository(AppDbContext context) : base(context) { }

    public async Task<Tournament?> GetByCodeAndSeasonAsync(string code, string season) =>
        await DbSet.FirstOrDefaultAsync(t => t.Code == code && t.Season == season);
}
