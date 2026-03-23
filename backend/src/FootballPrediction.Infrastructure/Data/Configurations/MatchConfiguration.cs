using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.HomeTeam).HasMaxLength(100).IsRequired();
        builder.Property(m => m.AwayTeam).HasMaxLength(100).IsRequired();
        builder.Property(m => m.Status).HasMaxLength(20);
        builder.Property(m => m.CompetitionCode).HasMaxLength(10).IsRequired();

        builder.HasIndex(m => m.KickoffTime);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => new { m.TournamentId, m.GameWeekId });

        builder.HasMany(m => m.Predictions)
            .WithOne(p => p.Match)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
