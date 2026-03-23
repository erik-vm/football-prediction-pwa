using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class PredictionConfiguration : IEntityTypeConfiguration<Prediction>
{
    public void Configure(EntityTypeBuilder<Prediction> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Status).HasMaxLength(20);
        builder.Property(p => p.CompetitionCode).HasMaxLength(10).IsRequired();

        builder.HasIndex(p => new { p.UserId, p.MatchId }).IsUnique();
        builder.HasIndex(p => p.Status);
    }
}
