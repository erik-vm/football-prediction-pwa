using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class GameWeekConfiguration : IEntityTypeConfiguration<GameWeek>
{
    public void Configure(EntityTypeBuilder<GameWeek> builder)
    {
        builder.ToTable("GameWeeks");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.WeekNumber)
            .IsRequired();

        builder.HasIndex(g => new { g.TournamentId, g.WeekNumber })
            .IsUnique();

        builder.HasOne(g => g.Tournament)
            .WithMany(t => t.GameWeeks)
            .HasForeignKey(g => g.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(g => g.Matches)
            .WithOne(m => m.GameWeek)
            .HasForeignKey(m => m.GameWeekId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
