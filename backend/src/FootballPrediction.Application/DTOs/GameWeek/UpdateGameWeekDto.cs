namespace FootballPrediction.Application.DTOs.GameWeek;

public class UpdateGameWeekDto
{
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
