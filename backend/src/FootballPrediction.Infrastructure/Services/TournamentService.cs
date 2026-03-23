using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Services;

public class TournamentService : ITournamentService
{
    private readonly ITournamentRepository _repository;

    public TournamentService(ITournamentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TournamentDto>> GetAllAsync()
    {
        var tournaments = await _repository.GetAllAsync();
        return tournaments.Select(MapToDto);
    }

    public async Task<TournamentDto?> GetByIdAsync(Guid id)
    {
        var tournament = await _repository.GetByIdAsync(id);
        return tournament == null ? null : MapToDto(tournament);
    }

    public async Task<TournamentDto> CreateAsync(TournamentDto dto)
    {
        var entity = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Code = dto.Code,
            Season = dto.Season,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Country = dto.Country,
            Type = dto.Type,
            LogoUrl = dto.LogoUrl
        };

        await _repository.AddAsync(entity);
        await _repository.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<bool> UpdateAsync(Guid id, TournamentDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        entity.Code = dto.Code;
        entity.Season = dto.Season;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
        entity.Country = dto.Country;
        entity.Type = dto.Type;
        entity.LogoUrl = dto.LogoUrl;

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

    private static TournamentDto MapToDto(Tournament t) =>
        new(t.Id, t.Name, t.Code, t.Season, t.StartDate, t.EndDate, t.Country, t.Type, t.LogoUrl);
}
