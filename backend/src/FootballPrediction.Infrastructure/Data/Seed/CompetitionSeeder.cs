using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Data.Seed;

public static class CompetitionSeeder
{
    public static async Task SeedCompetitionsAsync(ApplicationDbContext context)
    {
        if (await context.Competitions.AnyAsync())
        {
            return;
        }

        var competitions = new List<Competition>
        {
            new Competition { Code = "PL", Name = "Premier League", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "CL", Name = "Champions League", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "BL1", Name = "Bundesliga", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "SA", Name = "Serie A", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "PD", Name = "La Liga", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "FL1", Name = "Ligue 1", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "DED", Name = "Eredivisie", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "PPL", Name = "Primeira Liga", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "ELC", Name = "Championship", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "BSA", Name = "Brasileirão", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "WC", Name = "World Cup", IsActive = false, CreatedAt = DateTime.UtcNow },
            new Competition { Code = "EC", Name = "European Championship", IsActive = false, CreatedAt = DateTime.UtcNow }
        };

        await context.Competitions.AddRangeAsync(competitions);
        await context.SaveChangesAsync();
    }
}
