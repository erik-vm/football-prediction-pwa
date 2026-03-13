namespace FootballPrediction.Application.DTOs.Leaderboard;

public class LeaderboardEntryDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int TotalPredictions { get; set; }
    public double AveragePoints { get; set; }
    public int Rank { get; set; }
}
