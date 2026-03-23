using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class GameWeekConfiguration : IEntityTypeConfiguration<GameWeek>
{
    public void Configure(EntityTypeBuilder<GameWeek> builder)
    {
        builder.HasKey(gw => gw.Id);

        builder.HasIndex(gw => new { gw.TournamentId, gw.WeekNumber }).IsUnique();

        builder.HasMany(gw => gw.Matches)
            .WithOne(m => m.GameWeek)
            .HasForeignKey(m => m.GameWeekId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
