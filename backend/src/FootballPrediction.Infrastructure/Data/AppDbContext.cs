using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<GameWeek> GameWeeks => Set<GameWeek>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<Prediction> Predictions => Set<Prediction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified))
        {
            entry.Property("UpdatedAt").CurrentValue = now;

            if (entry.State == EntityState.Added)
            {
                entry.Property("CreatedAt").CurrentValue = now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
