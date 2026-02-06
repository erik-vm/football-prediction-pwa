using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class PredictionConfiguration : IEntityTypeConfiguration<Prediction>
{
    public void Configure(EntityTypeBuilder<Prediction> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.HomeScore)
            .IsRequired();

        builder.Property(p => p.AwayScore)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .IsRequired();

        builder.HasOne(p => p.User)
            .WithMany(u => u.Predictions)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Match)
            .WithMany(m => m.Predictions)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => p.MatchId);
        builder.HasIndex(p => new { p.UserId, p.MatchId })
            .IsUnique();
    }
}
