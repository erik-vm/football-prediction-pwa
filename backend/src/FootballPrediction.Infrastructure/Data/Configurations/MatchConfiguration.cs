using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("Matches");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.HomeTeam)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.AwayTeam)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Status)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(m => m.CompetitionCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.HasIndex(m => m.KickoffTime);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => new { m.TournamentId, m.GameWeekId });

        builder.HasOne(m => m.Tournament)
            .WithMany(t => t.Matches)
            .HasForeignKey(m => m.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.GameWeek)
            .WithMany(g => g.Matches)
            .HasForeignKey(m => m.GameWeekId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(m => m.Predictions)
            .WithOne(p => p.Match)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
