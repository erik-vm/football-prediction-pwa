namespace FootballPrediction.Application.DTOs.GameWeek;

public class GameWeekDto
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
