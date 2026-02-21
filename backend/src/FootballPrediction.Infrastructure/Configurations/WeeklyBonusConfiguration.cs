using FootballPrediction.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FootballPrediction.Infrastructure.Configurations;

public class WeeklyBonusConfiguration : IEntityTypeConfiguration<WeeklyBonus>
{
    public void Configure(EntityTypeBuilder<WeeklyBonus> builder)
    {
        builder.HasKey(wb => wb.Id);

        builder.Property(wb => wb.BonusPoints)
            .IsRequired();

        builder.Property(wb => wb.AwardedAt)
            .IsRequired();

        builder.HasOne(wb => wb.User)
            .WithMany()
            .HasForeignKey(wb => wb.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wb => wb.GameWeek)
            .WithMany()
            .HasForeignKey(wb => wb.GameWeekId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(wb => new { wb.UserId, wb.GameWeekId })
            .IsUnique();

        builder.HasIndex(wb => wb.GameWeekId);
    }
}
