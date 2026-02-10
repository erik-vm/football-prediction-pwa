namespace FootballPrediction.Application.DTOs.Tournament;

public class CreateTournamentDto
{
    public string Name { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}
