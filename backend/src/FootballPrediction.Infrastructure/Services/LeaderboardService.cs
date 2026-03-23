using FootballPrediction.Application.DTOs;
using FootballPrediction.Application.Interfaces.Repositories;
using FootballPrediction.Application.Interfaces.Services;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly IPredictionRepository _predictionRepository;

    public LeaderboardService(IPredictionRepository predictionRepository)
    {
        _predictionRepository = predictionRepository;
    }

    public async Task<IEnumerable<LeaderboardEntryDto>> GetOverallLeaderboardAsync(Guid tournamentId)
    {
        var predictions = await _predictionRepository.GetScoredByTournamentAsync(tournamentId);
        return BuildLeaderboard(predictions);
    }

    public async Task<IEnumerable<LeaderboardEntryDto>> GetByCompetitionAsync(string competitionCode)
    {
        var predictions = await _predictionRepository.GetScoredByCompetitionAsync(competitionCode);
        return BuildLeaderboard(predictions);
    }

    private static IEnumerable<LeaderboardEntryDto> BuildLeaderboard(IEnumerable<Prediction> predictions)
    {
        var grouped = predictions
            .Where(p => p.User != null)
            .GroupBy(p => new { p.UserId, p.User!.Username })
            .Select(g =>
            {
                var totalPoints = g.Sum(p => p.PointsEarned ?? 0);
                var totalPredictions = g.Count();
                var averagePoints = totalPredictions > 0 ? (double)totalPoints / totalPredictions : 0;
                var accuracy = totalPredictions > 0 ? (double)totalPoints / (totalPredictions * 5) * 100 : 0;

                return new
                {
                    g.Key.UserId,
                    g.Key.Username,
                    TotalPoints = totalPoints,
                    TotalPredictions = totalPredictions,
                    AveragePoints = Math.Round(averagePoints, 2),
                    Accuracy = Math.Round(accuracy, 1)
                };
            })
            .OrderByDescending(x => x.TotalPoints)
            .ThenByDescending(x => x.TotalPredictions)
            .ThenByDescending(x => x.AveragePoints)
            .ToList();

        return grouped.Select((entry, index) => new LeaderboardEntryDto(
            entry.UserId, entry.Username, entry.TotalPoints,
            entry.TotalPredictions, entry.AveragePoints, entry.Accuracy, index + 1));
    }
}
