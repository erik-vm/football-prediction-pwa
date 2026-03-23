using FootballPrediction.Application.DTOs;

namespace FootballPrediction.Application.Interfaces.Services;

public interface ITournamentService
{
    Task<IEnumerable<TournamentDto>> GetAllAsync();
    Task<TournamentDto?> GetByIdAsync(Guid id);
    Task<TournamentDto> CreateAsync(TournamentDto dto);
    Task<bool> UpdateAsync(Guid id, TournamentDto dto);
    Task<bool> DeleteAsync(Guid id);
}
