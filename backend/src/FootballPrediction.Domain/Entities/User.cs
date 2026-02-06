using FootballPrediction.Domain.Enums;

namespace FootballPrediction.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.USER;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
