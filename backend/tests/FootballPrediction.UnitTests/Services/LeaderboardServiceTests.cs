using FootballPrediction.Application.Services;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Domain.Enums;
using Moq;
using Xunit;

namespace FootballPrediction.UnitTests.Services;

public class LeaderboardServiceTests
{
    private readonly Mock<IMatchRepository> _matchRepositoryMock;
    private readonly Mock<IPredictionRepository> _predictionRepositoryMock;
    private readonly Mock<IWeeklyBonusRepository> _weeklyBonusRepositoryMock;
    private readonly LeaderboardService _service;

    public LeaderboardServiceTests()
    {
        _matchRepositoryMock = new Mock<IMatchRepository>();
        _predictionRepositoryMock = new Mock<IPredictionRepository>();
        _weeklyBonusRepositoryMock = new Mock<IWeeklyBonusRepository>();

        _service = new LeaderboardService(
            _matchRepositoryMock.Object,
            _predictionRepositoryMock.Object,
            _weeklyBonusRepositoryMock.Object
        );
    }

    [Fact]
    public async Task GetOverallLeaderboardAsync_ReturnsOrderedByTotalPoints()
    {
        // Arrange
        var tournamentId = Guid.NewGuid();
        var match1Id = Guid.NewGuid();
        var match2Id = Guid.NewGuid();
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

        var match1 = new Domain.Entities.Match { Id = match1Id, HomeTeam = "Team A", AwayTeam = "Team B", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };
        var match2 = new Domain.Entities.Match { Id = match2Id, HomeTeam = "Team C", AwayTeam = "Team D", Stage = TournamentStage.ROUND_OF_16, IsFinished = true };

        var user1 = new User { Id = user1Id, Username = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var user2 = new User { Id = user2Id, Username = "Bob", Email = "bob@test.com", PasswordHash = "hash" };

        var predictions = new List<Prediction>
        {
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match1Id, PointsEarned = 5, User = user1, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match2Id, PointsEarned = 8, User = user1, Match = match2 },
            new() { Id = Guid.NewGuid(), UserId = user2Id, MatchId = match1Id, PointsEarned = 3, User = user2, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user2Id, MatchId = match2Id, PointsEarned = 6, User = user2, Match = match2 }
        };

        var bonuses = new List<WeeklyBonus>
        {
            new() { UserId = user1Id, BonusPoints = 5 },
            new() { UserId = user2Id, BonusPoints = 3 }
        };

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByTournamentAsync(tournamentId))
            .ReturnsAsync(new List<Guid> { match1Id, match2Id });

        _predictionRepositoryMock.Setup(r => r.GetByMatchIdsWithUserAndMatchAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(predictions);

        _weeklyBonusRepositoryMock.Setup(r => r.GetByTournamentIdAsync(tournamentId))
            .ReturnsAsync(bonuses);

        // Act
        var result = (await _service.GetOverallLeaderboardAsync(tournamentId)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].Rank);
        Assert.Equal("Alice", result[0].Username);
        Assert.Equal(13, result[0].PredictionPoints); // 5 + 8
        Assert.Equal(5, result[0].BonusPoints);
        Assert.Equal(18, result[0].TotalPoints); // 13 + 5

        Assert.Equal(2, result[1].Rank);
        Assert.Equal("Bob", result[1].Username);
        Assert.Equal(9, result[1].PredictionPoints); // 3 + 6
        Assert.Equal(3, result[1].BonusPoints);
        Assert.Equal(12, result[1].TotalPoints); // 9 + 3
    }

    [Fact]
    public async Task GetOverallLeaderboardAsync_CalculatesExactScoresCorrectly()
    {
        // Arrange
        var tournamentId = Guid.NewGuid();
        var match1Id = Guid.NewGuid();
        var match2Id = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var match1 = new Domain.Entities.Match { Id = match1Id, HomeTeam = "Team A", AwayTeam = "Team B", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };
        var match2 = new Domain.Entities.Match { Id = match2Id, HomeTeam = "Team C", AwayTeam = "Team D", Stage = TournamentStage.ROUND_OF_16, IsFinished = true };

        var user = new User { Id = userId, Username = "Alice", Email = "alice@test.com", PasswordHash = "hash" };

        var predictions = new List<Prediction>
        {
            new() { Id = Guid.NewGuid(), UserId = userId, MatchId = match1Id, PointsEarned = 5, User = user, Match = match1 }, // Exact score (5 base)
            new() { Id = Guid.NewGuid(), UserId = userId, MatchId = match2Id, PointsEarned = 10, User = user, Match = match2 } // Exact score (5 * 2)
        };

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByTournamentAsync(tournamentId))
            .ReturnsAsync(new List<Guid> { match1Id, match2Id });

        _predictionRepositoryMock.Setup(r => r.GetByMatchIdsWithUserAndMatchAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(predictions);

        _weeklyBonusRepositoryMock.Setup(r => r.GetByTournamentIdAsync(tournamentId))
            .ReturnsAsync(new List<WeeklyBonus>());

        // Act
        var result = (await _service.GetOverallLeaderboardAsync(tournamentId)).ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal(2, result[0].ExactScores); // Both predictions had base points = 5
        Assert.Equal(2, result[0].CorrectWinners); // >= 3 base points
    }

    [Fact]
    public async Task GetWeeklyLeaderboardAsync_ReturnsOrderedByWeeklyPoints()
    {
        // Arrange
        var gameWeekId = Guid.NewGuid();
        var match1Id = Guid.NewGuid();
        var match2Id = Guid.NewGuid();
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

        var match1 = new Domain.Entities.Match { Id = match1Id, HomeTeam = "Team A", AwayTeam = "Team B", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };
        var match2 = new Domain.Entities.Match { Id = match2Id, HomeTeam = "Team C", AwayTeam = "Team D", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };

        var user1 = new User { Id = user1Id, Username = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var user2 = new User { Id = user2Id, Username = "Bob", Email = "bob@test.com", PasswordHash = "hash" };

        var predictions = new List<Prediction>
        {
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match1Id, PointsEarned = 5, User = user1, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match2Id, PointsEarned = 4, User = user1, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user2Id, MatchId = match1Id, PointsEarned = 3, User = user2, Match = match2 },
            new() { Id = Guid.NewGuid(), UserId = user2Id, MatchId = match2Id, PointsEarned = 3, User = user2, Match = match2 }
        };

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByGameWeekAsync(gameWeekId))
            .ReturnsAsync(new List<Guid> { match1Id, match2Id });

        _predictionRepositoryMock.Setup(r => r.GetByMatchIdsWithUserAndMatchAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(predictions);

        _weeklyBonusRepositoryMock.Setup(r => r.GetByGameWeekIdAsync(gameWeekId))
            .ReturnsAsync(new List<WeeklyBonus>());

        // Act
        var result = (await _service.GetWeeklyLeaderboardAsync(gameWeekId)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Alice", result[0].Username);
        Assert.Equal(9, result[0].WeeklyPoints);
        Assert.Equal("Bob", result[1].Username);
        Assert.Equal(6, result[1].WeeklyPoints);
    }

    [Fact]
    public async Task CalculateAndApplyWeeklyBonusesAsync_AwardsCorrectBonuses()
    {
        // Arrange
        var gameWeekId = Guid.NewGuid();
        var match1Id = Guid.NewGuid();
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();
        var user3Id = Guid.NewGuid();

        var match1 = new Domain.Entities.Match { Id = match1Id, HomeTeam = "Team A", AwayTeam = "Team B", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };

        var predictions = new List<Prediction>
        {
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match1Id, PointsEarned = 10, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user2Id, MatchId = match1Id, PointsEarned = 8, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user3Id, MatchId = match1Id, PointsEarned = 6, Match = match1 }
        };

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByGameWeekAsync(gameWeekId))
            .ReturnsAsync(new List<Guid> { match1Id });

        _predictionRepositoryMock.Setup(r => r.GetByMatchIdsWithUserAndMatchAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(predictions);

        _weeklyBonusRepositoryMock.Setup(r => r.GetByGameWeekIdAsync(gameWeekId))
            .ReturnsAsync(new List<WeeklyBonus>());

        // Act
        await _service.CalculateAndApplyWeeklyBonusesAsync(gameWeekId);

        // Assert
        _weeklyBonusRepositoryMock.Verify(r => r.AddRangeAsync(It.Is<IEnumerable<WeeklyBonus>>(bonuses =>
            bonuses.Count() == 3 &&
            bonuses.Any(b => b.UserId == user1Id && b.BonusPoints == 5) && // 1st: 5 points
            bonuses.Any(b => b.UserId == user2Id && b.BonusPoints == 3) && // 2nd: 3 points
            bonuses.Any(b => b.UserId == user3Id && b.BonusPoints == 1)    // 3rd: 1 point
        )), Times.Once);

        _weeklyBonusRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CalculateAndApplyWeeklyBonusesAsync_SplitsBonusOnTie()
    {
        // Arrange
        var gameWeekId = Guid.NewGuid();
        var match1Id = Guid.NewGuid();
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

        var match1 = new Domain.Entities.Match { Id = match1Id, HomeTeam = "Team A", AwayTeam = "Team B", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };

        var predictions = new List<Prediction>
        {
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match1Id, PointsEarned = 10, Match = match1 },
            new() { Id = Guid.NewGuid(), UserId = user2Id, MatchId = match1Id, PointsEarned = 10, Match = match1 } // Tie for 1st
        };

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByGameWeekAsync(gameWeekId))
            .ReturnsAsync(new List<Guid> { match1Id });

        _predictionRepositoryMock.Setup(r => r.GetByMatchIdsWithUserAndMatchAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(predictions);

        _weeklyBonusRepositoryMock.Setup(r => r.GetByGameWeekIdAsync(gameWeekId))
            .ReturnsAsync(new List<WeeklyBonus>());

        // Act
        await _service.CalculateAndApplyWeeklyBonusesAsync(gameWeekId);

        // Assert
        _weeklyBonusRepositoryMock.Verify(r => r.AddRangeAsync(It.Is<IEnumerable<WeeklyBonus>>(bonuses =>
            bonuses.Count() == 2 &&
            bonuses.All(b => b.BonusPoints == 2) // 5 / 2 = 2 (integer division)
        )), Times.Once);
    }

    [Fact]
    public async Task CalculateAndApplyWeeklyBonusesAsync_DoesNothingWhenNoMatches()
    {
        // Arrange
        var gameWeekId = Guid.NewGuid();

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByGameWeekAsync(gameWeekId))
            .ReturnsAsync(new List<Guid>());

        _weeklyBonusRepositoryMock.Setup(r => r.GetByGameWeekIdAsync(gameWeekId))
            .ReturnsAsync(new List<WeeklyBonus>());

        // Act
        await _service.CalculateAndApplyWeeklyBonusesAsync(gameWeekId);

        // Assert
        _weeklyBonusRepositoryMock.Verify(r => r.AddRangeAsync(It.IsAny<IEnumerable<WeeklyBonus>>()), Times.Never);
    }

    [Fact]
    public async Task CalculateAndApplyWeeklyBonusesAsync_RemovesExistingBonuses()
    {
        // Arrange
        var gameWeekId = Guid.NewGuid();
        var match1Id = Guid.NewGuid();
        var user1Id = Guid.NewGuid();

        var existingBonuses = new List<WeeklyBonus>
        {
            new() { Id = Guid.NewGuid(), UserId = user1Id, GameWeekId = gameWeekId, BonusPoints = 5 }
        };

        var match1 = new Domain.Entities.Match { Id = match1Id, HomeTeam = "Team A", AwayTeam = "Team B", Stage = TournamentStage.GROUP_STAGE, IsFinished = true };

        var predictions = new List<Prediction>
        {
            new() { Id = Guid.NewGuid(), UserId = user1Id, MatchId = match1Id, PointsEarned = 10, Match = match1 }
        };

        _matchRepositoryMock.Setup(r => r.GetFinishedMatchIdsByGameWeekAsync(gameWeekId))
            .ReturnsAsync(new List<Guid> { match1Id });

        _predictionRepositoryMock.Setup(r => r.GetByMatchIdsWithUserAndMatchAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync(predictions);

        _weeklyBonusRepositoryMock.Setup(r => r.GetByGameWeekIdAsync(gameWeekId))
            .ReturnsAsync(existingBonuses);

        // Act
        await _service.CalculateAndApplyWeeklyBonusesAsync(gameWeekId);

        // Assert
        _weeklyBonusRepositoryMock.Verify(r => r.RemoveRangeAsync(existingBonuses), Times.Once);
        _weeklyBonusRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Exactly(2)); // Once for remove, once for add
    }
}
