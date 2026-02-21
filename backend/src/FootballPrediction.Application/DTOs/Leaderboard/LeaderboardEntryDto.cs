namespace FootballPrediction.Application.DTOs.Leaderboard;

public class LeaderboardEntryDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Rank { get; set; }
    public int TotalPoints { get; set; }
    public int PredictionPoints { get; set; }
    public int BonusPoints { get; set; }
    public int ExactScores { get; set; }
    public int CorrectWinners { get; set; }
    public int TotalPredictions { get; set; }
}
