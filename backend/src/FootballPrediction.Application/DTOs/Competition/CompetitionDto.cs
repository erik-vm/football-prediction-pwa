namespace FootballPrediction.Application.DTOs.Competition;

public class CompetitionDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Emblem { get; set; }
    public bool IsActive { get; set; }
}
