using FootballPrediction.Application.DTOs;

namespace FootballPrediction.Application.Interfaces.Services;

public interface IMatchService
{
    Task<IEnumerable<MatchDto>> GetAllAsync();
    Task<MatchDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<MatchDto>> GetUpcomingAsync();
    Task<IEnumerable<MatchDto>> GetFinishedAsync();
    Task<IEnumerable<MatchDto>> GetFilteredAsync(string? competitionCode, int? matchday);
    Task<IEnumerable<string>> GetCompetitionsAsync();
    Task<IEnumerable<int>> GetMatchdaysAsync(string competitionCode);
    Task<int?> GetNearestMatchdayAsync(string competitionCode, string tab);
    Task<MatchDto> CreateAsync(MatchDto dto);
    Task<bool> UpdateAsync(Guid id, MatchDto dto);
    Task<bool> DeleteAsync(Guid id);
}
