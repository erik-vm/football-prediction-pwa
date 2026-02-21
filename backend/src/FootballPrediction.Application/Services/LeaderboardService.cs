using FootballPrediction.Application.DTOs.Leaderboard;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly IMatchRepository _matchRepository;
    private readonly IPredictionRepository _predictionRepository;
    private readonly IWeeklyBonusRepository _weeklyBonusRepository;

    public LeaderboardService(
        IMatchRepository matchRepository,
        IPredictionRepository predictionRepository,
        IWeeklyBonusRepository weeklyBonusRepository)
    {
        _matchRepository = matchRepository;
        _predictionRepository = predictionRepository;
        _weeklyBonusRepository = weeklyBonusRepository;
    }

    public async Task<IEnumerable<LeaderboardEntryDto>> GetOverallLeaderboardAsync(Guid tournamentId)
    {
        var matchIds = await _matchRepository.GetFinishedMatchIdsByTournamentAsync(tournamentId);
        var userPredictions = await _predictionRepository.GetByMatchIdsWithUserAndMatchAsync(matchIds);
        var weeklyBonuses = await _weeklyBonusRepository.GetByTournamentIdAsync(tournamentId);

        var userStats = userPredictions
            .GroupBy(p => new { p.UserId, p.User.Username })
            .Select(g => new
            {
                g.Key.UserId,
                g.Key.Username,
                PredictionPoints = g.Sum(p => p.PointsEarned ?? 0),
                BonusPoints = weeklyBonuses.Where(wb => wb.UserId == g.Key.UserId).Sum(wb => wb.BonusPoints),
                ExactScores = g.Count(p => GetBasePoints(p) == 5),
                CorrectWinners = g.Count(p => GetBasePoints(p) >= 3),
                TotalPredictions = g.Count()
            })
            .OrderByDescending(u => u.PredictionPoints + u.BonusPoints)
            .ThenByDescending(u => u.ExactScores)
            .ThenByDescending(u => u.CorrectWinners)
            .ThenBy(u => u.Username)
            .ToList();

        var leaderboard = userStats.Select((u, index) => new LeaderboardEntryDto
        {
            UserId = u.UserId,
            Username = u.Username,
            Rank = index + 1,
            PredictionPoints = u.PredictionPoints,
            BonusPoints = u.BonusPoints,
            TotalPoints = u.PredictionPoints + u.BonusPoints,
            ExactScores = u.ExactScores,
            CorrectWinners = u.CorrectWinners,
            TotalPredictions = u.TotalPredictions
        });

        return leaderboard;
    }

    public async Task<IEnumerable<WeeklyLeaderboardEntryDto>> GetWeeklyLeaderboardAsync(Guid gameWeekId)
    {
        var matchIds = await _matchRepository.GetFinishedMatchIdsByGameWeekAsync(gameWeekId);
        var userPredictions = await _predictionRepository.GetByMatchIdsWithUserAndMatchAsync(matchIds);
        var weeklyBonuses = await _weeklyBonusRepository.GetByGameWeekIdAsync(gameWeekId);

        var userStats = userPredictions
            .GroupBy(p => new { p.UserId, p.User.Username })
            .Select(g => new
            {
                g.Key.UserId,
                g.Key.Username,
                WeeklyPoints = g.Sum(p => p.PointsEarned ?? 0),
                BonusPoints = weeklyBonuses.Where(wb => wb.UserId == g.Key.UserId).Sum(wb => wb.BonusPoints),
                ExactScores = g.Count(p => GetBasePoints(p) == 5),
                CorrectWinners = g.Count(p => GetBasePoints(p) >= 3),
                TotalPredictions = g.Count()
            })
            .OrderByDescending(u => u.WeeklyPoints)
            .ThenByDescending(u => u.ExactScores)
            .ThenByDescending(u => u.CorrectWinners)
            .ThenBy(u => u.Username)
            .ToList();

        var leaderboard = userStats.Select((u, index) => new WeeklyLeaderboardEntryDto
        {
            UserId = u.UserId,
            Username = u.Username,
            Rank = index + 1,
            WeeklyPoints = u.WeeklyPoints,
            BonusPoints = u.BonusPoints,
            ExactScores = u.ExactScores,
            CorrectWinners = u.CorrectWinners,
            TotalPredictions = u.TotalPredictions
        });

        return leaderboard;
    }

    public async Task CalculateAndApplyWeeklyBonusesAsync(Guid gameWeekId)
    {
        var existingBonuses = await _weeklyBonusRepository.GetByGameWeekIdAsync(gameWeekId);

        if (existingBonuses.Any())
        {
            await _weeklyBonusRepository.RemoveRangeAsync(existingBonuses);
            await _weeklyBonusRepository.SaveChangesAsync();
        }

        var matchIds = await _matchRepository.GetFinishedMatchIdsByGameWeekAsync(gameWeekId);

        if (!matchIds.Any())
        {
            return;
        }

        var predictions = await _predictionRepository.GetByMatchIdsWithUserAndMatchAsync(matchIds);

        var userPoints = predictions
            .GroupBy(p => p.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                TotalPoints = g.Sum(p => p.PointsEarned ?? 0)
            })
            .OrderByDescending(u => u.TotalPoints)
            .ToList();

        if (!userPoints.Any())
        {
            return;
        }

        var bonuses = new List<WeeklyBonus>();
        var positions = new[] { (rank: 1, points: 5), (rank: 2, points: 3), (rank: 3, points: 1) };
        var awardedUserIds = new HashSet<Guid>();
        var currentIndex = 0;

        foreach (var position in positions)
        {
            if (currentIndex >= userPoints.Count)
            {
                break;
            }

            var usersAtPosition = userPoints
                .Skip(currentIndex)
                .TakeWhile(u => u.TotalPoints == userPoints[currentIndex].TotalPoints)
                .ToList();

            if (usersAtPosition.Any())
            {
                var bonusPerUser = position.points / usersAtPosition.Count;

                foreach (var user in usersAtPosition)
                {
                    if (!awardedUserIds.Contains(user.UserId))
                    {
                        bonuses.Add(new WeeklyBonus
                        {
                            Id = Guid.NewGuid(),
                            UserId = user.UserId,
                            GameWeekId = gameWeekId,
                            BonusPoints = bonusPerUser,
                            AwardedAt = DateTime.UtcNow
                        });
                        awardedUserIds.Add(user.UserId);
                    }
                }

                currentIndex += usersAtPosition.Count;
            }
        }

        if (bonuses.Any())
        {
            await _weeklyBonusRepository.AddRangeAsync(bonuses);
            await _weeklyBonusRepository.SaveChangesAsync();
        }
    }

    private static int GetBasePoints(Prediction prediction)
    {
        if (!prediction.PointsEarned.HasValue)
        {
            return 0;
        }

        var multiplier = prediction.Match.StageMultiplier > 0 ? prediction.Match.StageMultiplier : 1;
        return prediction.PointsEarned.Value / multiplier;
    }
}
