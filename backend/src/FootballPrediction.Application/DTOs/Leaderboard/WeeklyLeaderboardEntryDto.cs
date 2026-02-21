namespace FootballPrediction.Application.DTOs.Leaderboard;

public class WeeklyLeaderboardEntryDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Rank { get; set; }
    public int WeeklyPoints { get; set; }
    public int BonusPoints { get; set; }
    public int ExactScores { get; set; }
    public int CorrectWinners { get; set; }
    public int TotalPredictions { get; set; }
}
