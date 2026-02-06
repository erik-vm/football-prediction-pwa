using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class TournamentConfiguration : IEntityTypeConfiguration<Tournament>
{
    public void Configure(EntityTypeBuilder<Tournament> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Season)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.StartDate)
            .IsRequired();

        builder.Property(t => t.EndDate)
            .IsRequired();

        builder.Property(t => t.IsActive)
            .IsRequired();

        builder.HasMany(t => t.GameWeeks)
            .WithOne(g => g.Tournament)
            .HasForeignKey(g => g.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
