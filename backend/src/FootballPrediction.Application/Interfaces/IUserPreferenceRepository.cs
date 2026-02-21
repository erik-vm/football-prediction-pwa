using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Interfaces;

public interface IUserPreferenceRepository
{
    Task<IEnumerable<UserCompetitionPreference>> GetUserPreferencesAsync(Guid userId);
    Task<UserCompetitionPreference?> AddPreferenceAsync(Guid userId, string competitionCode);
    Task<bool> RemovePreferenceAsync(Guid userId, string competitionCode);
    Task<bool> HasPreferenceAsync(Guid userId, string competitionCode);
}
