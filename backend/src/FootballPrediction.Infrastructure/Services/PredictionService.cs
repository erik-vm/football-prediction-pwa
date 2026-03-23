using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Services;

public class PredictionService : IPredictionService
{
    private readonly IPredictionRepository _predictionRepository;
    private readonly IMatchRepository _matchRepository;

    public PredictionService(IPredictionRepository predictionRepository, IMatchRepository matchRepository)
    {
        _predictionRepository = predictionRepository;
        _matchRepository = matchRepository;
    }

    public async Task<PredictionDto?> GetByIdAsync(Guid id)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        return prediction == null ? null : MapToDto(prediction);
    }

    public async Task<IEnumerable<PredictionDto>> GetByUserAsync(Guid userId)
    {
        var predictions = await _predictionRepository.GetByUserAsync(userId);
        return predictions.Select(p => MapToDto(p, p.Match));
    }

    public async Task<PredictionDto?> GetByMatchAndUserAsync(Guid matchId, Guid userId)
    {
        var prediction = await _predictionRepository.GetByMatchAndUserAsync(matchId, userId);
        return prediction == null ? null : MapToDto(prediction);
    }

    public async Task<PredictionDto?> CreateAsync(Guid userId, PredictionRequest request)
    {
        var match = await _matchRepository.GetByIdAsync(request.MatchId);
        if (match == null || match.KickoffTime <= DateTime.UtcNow) return null;

        var existing = await _predictionRepository.GetByMatchAndUserAsync(request.MatchId, userId);
        if (existing != null) return null;

        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MatchId = request.MatchId,
            HomeScore = request.HomeScore,
            AwayScore = request.AwayScore,
            Status = "PENDING",
            CompetitionCode = match.CompetitionCode
        };

        await _predictionRepository.AddAsync(prediction);
        await _predictionRepository.SaveChangesAsync();
        return MapToDto(prediction);
    }

    public async Task<bool> UpdateAsync(Guid id, Guid userId, PredictionRequest request)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null || prediction.UserId != userId) return false;

        var match = await _matchRepository.GetByIdAsync(prediction.MatchId);
        if (match == null || match.KickoffTime <= DateTime.UtcNow) return false;

        prediction.HomeScore = request.HomeScore;
        prediction.AwayScore = request.AwayScore;

        _predictionRepository.Update(prediction);
        await _predictionRepository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var prediction = await _predictionRepository.GetByIdAsync(id);
        if (prediction == null || prediction.UserId != userId) return false;

        var match = await _matchRepository.GetByIdAsync(prediction.MatchId);
        if (match == null || match.KickoffTime <= DateTime.UtcNow) return false;

        _predictionRepository.Delete(prediction);
        await _predictionRepository.SaveChangesAsync();
        return true;
    }

    private static PredictionDto MapToDto(Prediction p, Match? match = null) =>
        new(p.Id, p.UserId, p.MatchId, p.HomeScore, p.AwayScore,
            p.PointsEarned, p.Status, p.CompetitionCode, p.CreatedAt, p.UpdatedAt,
            match == null ? null : new MatchDto(match.Id, match.TournamentId, match.GameWeekId,
                match.HomeTeam, match.AwayTeam, match.KickoffTime, match.HomeScore, match.AwayScore,
                match.Status, match.CompetitionCode, match.Season, match.Matchday, match.IsFinished));
}
