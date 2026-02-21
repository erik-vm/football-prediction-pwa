using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.HomeTeam)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.AwayTeam)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.KickoffTime)
            .IsRequired();

        builder.Property(m => m.Stage)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(m => m.IsFinished)
            .IsRequired();

        builder.Property(m => m.CompetitionCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(m => m.Venue)
            .HasMaxLength(200);

        builder.Property(m => m.Matchday);

        builder.Property(m => m.ExternalMatchId);

        builder.Ignore(m => m.StageMultiplier);

        builder.HasOne(m => m.GameWeek)
            .WithMany(g => g.Matches)
            .HasForeignKey(m => m.GameWeekId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        builder.HasOne(m => m.Competition)
            .WithMany(c => c.Matches)
            .HasForeignKey(m => m.CompetitionCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(m => m.Predictions)
            .WithOne(p => p.Match)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => m.GameWeekId);
        builder.HasIndex(m => m.KickoffTime);
        builder.HasIndex(m => m.IsFinished);
        builder.HasIndex(m => m.CompetitionCode);
        builder.HasIndex(m => m.Matchday);
        builder.HasIndex(m => m.ExternalMatchId)
            .IsUnique()
            .HasFilter("\"ExternalMatchId\" IS NOT NULL");

        builder.HasIndex(m => new { m.CompetitionCode, m.IsFinished, m.Matchday });
        builder.HasIndex(m => new { m.CompetitionCode, m.KickoffTime });
    }
}
