using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class GameWeekConfiguration : IEntityTypeConfiguration<GameWeek>
{
    public void Configure(EntityTypeBuilder<GameWeek> builder)
    {
        builder.HasKey(g => g.Id);

        builder.Property(g => g.WeekNumber)
            .IsRequired();

        builder.Property(g => g.StartDate)
            .IsRequired();

        builder.Property(g => g.EndDate)
            .IsRequired();

        builder.HasOne(g => g.Tournament)
            .WithMany(t => t.GameWeeks)
            .HasForeignKey(g => g.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(g => g.Matches)
            .WithOne(m => m.GameWeek)
            .HasForeignKey(m => m.GameWeekId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
