using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class TournamentConfiguration : IEntityTypeConfiguration<Tournament>
{
    public void Configure(EntityTypeBuilder<Tournament> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Code).HasMaxLength(10).IsRequired();
        builder.Property(t => t.Season).HasMaxLength(20).IsRequired();

        builder.HasIndex(t => new { t.Code, t.Season }).IsUnique();

        builder.HasMany(t => t.Matches)
            .WithOne(m => m.Tournament)
            .HasForeignKey(m => m.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.GameWeeks)
            .WithOne(gw => gw.Tournament)
            .HasForeignKey(gw => gw.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
