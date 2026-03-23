using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class GameWeekRepository : Repository<GameWeek>, IGameWeekRepository
{
    public GameWeekRepository(AppDbContext context) : base(context) { }

    public async Task<GameWeek?> GetByTournamentAndWeekAsync(Guid tournamentId, int weekNumber) =>
        await DbSet.FirstOrDefaultAsync(gw => gw.TournamentId == tournamentId && gw.WeekNumber == weekNumber);
}
