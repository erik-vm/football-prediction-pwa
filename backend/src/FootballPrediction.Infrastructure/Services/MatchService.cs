using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Services;

public class MatchService : IMatchService
{
    private readonly IMatchRepository _repository;

    public MatchService(IMatchRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MatchDto>> GetAllAsync() =>
        (await _repository.GetAllAsync()).Select(MapToDto);

    public async Task<MatchDto?> GetByIdAsync(Guid id)
    {
        var match = await _repository.GetByIdAsync(id);
        return match == null ? null : MapToDto(match);
    }

    public async Task<IEnumerable<MatchDto>> GetUpcomingAsync() =>
        (await _repository.GetUpcomingAsync()).Select(MapToDto);

    public async Task<IEnumerable<MatchDto>> GetFinishedAsync() =>
        (await _repository.GetFinishedAsync()).Select(MapToDto);

    public async Task<IEnumerable<MatchDto>> GetFilteredAsync(string? competitionCode, int? matchday) =>
        (await _repository.GetFilteredAsync(competitionCode, matchday)).Select(MapToDto);

    public async Task<IEnumerable<string>> GetCompetitionsAsync() =>
        await _repository.GetCompetitionsAsync();

    public async Task<IEnumerable<int>> GetMatchdaysAsync(string competitionCode) =>
        await _repository.GetMatchdaysAsync(competitionCode);

    public async Task<int?> GetNearestMatchdayAsync(string competitionCode, string tab) =>
        await _repository.GetNearestMatchdayAsync(competitionCode, tab);

    public async Task<MatchDto> CreateAsync(MatchDto dto)
    {
        var entity = new Match
        {
            Id = Guid.NewGuid(),
            TournamentId = dto.TournamentId,
            GameWeekId = dto.GameWeekId,
            HomeTeam = dto.HomeTeam,
            AwayTeam = dto.AwayTeam,
            KickoffTime = dto.KickoffTime,
            HomeScore = dto.HomeScore,
            AwayScore = dto.AwayScore,
            Status = dto.Status,
            CompetitionCode = dto.CompetitionCode,
            Season = dto.Season,
            Matchday = dto.Matchday,
            IsFinished = dto.IsFinished
        };

        await _repository.AddAsync(entity);
        await _repository.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<bool> UpdateAsync(Guid id, MatchDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.HomeTeam = dto.HomeTeam;
        entity.AwayTeam = dto.AwayTeam;
        entity.KickoffTime = dto.KickoffTime;
        entity.HomeScore = dto.HomeScore;
        entity.AwayScore = dto.AwayScore;
        entity.Status = dto.Status;
        entity.Matchday = dto.Matchday;
        entity.IsFinished = dto.IsFinished;

        _repository.Update(entity);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        _repository.Delete(entity);
        await _repository.SaveChangesAsync();
        return true;
    }

    private static MatchDto MapToDto(Match m) =>
        new(m.Id, m.TournamentId, m.GameWeekId, m.HomeTeam, m.AwayTeam,
            m.KickoffTime, m.HomeScore, m.AwayScore, m.Status,
            m.CompetitionCode, m.Season, m.Matchday, m.IsFinished);
}
