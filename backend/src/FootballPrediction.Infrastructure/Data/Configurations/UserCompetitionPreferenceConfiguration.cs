using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class UserCompetitionPreferenceConfiguration : IEntityTypeConfiguration<UserCompetitionPreference>
{
    public void Configure(EntityTypeBuilder<UserCompetitionPreference> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.CompetitionCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Competition)
            .WithMany()
            .HasForeignKey(p => p.CompetitionCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => new { p.UserId, p.CompetitionCode })
            .IsUnique();
    }
}
