using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class UserCompetitionStatsConfiguration : IEntityTypeConfiguration<UserCompetitionStats>
{
    public void Configure(EntityTypeBuilder<UserCompetitionStats> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.CompetitionCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(s => s.TotalPoints)
            .IsRequired();

        builder.Property(s => s.TotalPredictions)
            .IsRequired();

        builder.Property(s => s.Accuracy)
            .IsRequired()
            .HasColumnType("decimal(5,2)");

        builder.Property(s => s.UpdatedAt)
            .IsRequired();

        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Competition)
            .WithMany()
            .HasForeignKey(s => s.CompetitionCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.CompetitionCode);
        builder.HasIndex(s => s.TotalPoints);
        builder.HasIndex(s => new { s.UserId, s.CompetitionCode })
            .IsUnique();
    }
}
