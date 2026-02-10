using FootballPrediction.Application.Interfaces;
using FootballPrediction.Application.Services;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Domain.Enums;
using Moq;
using DomainMatch = FootballPrediction.Domain.Entities.Match;

namespace FootballPrediction.UnitTests.Services;

public class MatchResultServiceTests
{
    private readonly Mock<IMatchRepository> _matchRepositoryMock;
    private readonly Mock<IPredictionRepository> _predictionRepositoryMock;
    private readonly Mock<IScoringService> _scoringServiceMock;
    private readonly MatchResultService _service;

    public MatchResultServiceTests()
    {
        _matchRepositoryMock = new Mock<IMatchRepository>();
        _predictionRepositoryMock = new Mock<IPredictionRepository>();
        _scoringServiceMock = new Mock<IScoringService>();
        _service = new MatchResultService(
            _matchRepositoryMock.Object,
            _predictionRepositoryMock.Object,
            _scoringServiceMock.Object
        );
    }

    [Fact]
    public async Task EnterResultAsync_ThrowsException_WhenMatchNotFound()
    {
        _matchRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((DomainMatch?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.EnterResultAsync(Guid.NewGuid(), 2, 1)
        );
    }

    [Fact]
    public async Task EnterResultAsync_ThrowsException_WhenMatchAlreadyFinished()
    {
        var match = new DomainMatch
        {
            Id = Guid.NewGuid(),
            GameWeekId = Guid.NewGuid(),
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = DateTime.UtcNow,
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = true,
            HomeScore = 1,
            AwayScore = 1
        };

        _matchRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(match);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.EnterResultAsync(match.Id, 2, 1)
        );
    }

    [Fact]
    public async Task EnterResultAsync_UpdatesMatchAndCalculatesPoints_WithGroupStageMultiplier()
    {
        var matchId = Guid.NewGuid();
        var match = new DomainMatch
        {
            Id = matchId,
            GameWeekId = Guid.NewGuid(),
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = DateTime.UtcNow,
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        var prediction1 = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            MatchId = matchId,
            HomeScore = 2,
            AwayScore = 1,
            PointsEarned = 0
        };

        var prediction2 = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            MatchId = matchId,
            HomeScore = 1,
            AwayScore = 1,
            PointsEarned = 0
        };

        _matchRepositoryMock.Setup(x => x.GetByIdAsync(matchId))
            .ReturnsAsync(match);

        _predictionRepositoryMock.Setup(x => x.GetByMatchIdAsync(matchId))
            .ReturnsAsync(new[] { prediction1, prediction2 });

        _scoringServiceMock.Setup(x => x.CalculatePoints(2, 1, 2, 1))
            .Returns(5); // Exact score

        _scoringServiceMock.Setup(x => x.CalculatePoints(1, 1, 2, 1))
            .Returns(3); // Correct winner only

        await _service.EnterResultAsync(matchId, 2, 1);

        Assert.True(match.IsFinished);
        Assert.Equal(2, match.HomeScore);
        Assert.Equal(1, match.AwayScore);
        Assert.Equal(5, prediction1.PointsEarned); // 5 * 1 (GROUP_STAGE multiplier)
        Assert.Equal(3, prediction2.PointsEarned); // 3 * 1 (GROUP_STAGE multiplier)

        _matchRepositoryMock.Verify(x => x.UpdateAsync(match), Times.Once);
        _predictionRepositoryMock.Verify(x => x.UpdateAsync(prediction1), Times.Once);
        _predictionRepositoryMock.Verify(x => x.UpdateAsync(prediction2), Times.Once);
        _matchRepositoryMock.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task EnterResultAsync_AppliesStageMultiplier_ForFinal()
    {
        var matchId = Guid.NewGuid();
        var match = new DomainMatch
        {
            Id = matchId,
            GameWeekId = Guid.NewGuid(),
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = DateTime.UtcNow,
            Stage = TournamentStage.FINAL,
            IsFinished = false
        };

        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            MatchId = matchId,
            HomeScore = 3,
            AwayScore = 1,
            PointsEarned = 0
        };

        _matchRepositoryMock.Setup(x => x.GetByIdAsync(matchId))
            .ReturnsAsync(match);

        _predictionRepositoryMock.Setup(x => x.GetByMatchIdAsync(matchId))
            .ReturnsAsync(new[] { prediction });

        _scoringServiceMock.Setup(x => x.CalculatePoints(3, 1, 3, 1))
            .Returns(5); // Exact score

        await _service.EnterResultAsync(matchId, 3, 1);

        Assert.Equal(25, prediction.PointsEarned); // 5 * 5 (FINAL multiplier)
    }

    [Fact]
    public async Task EnterResultAsync_HandlesNoPredictions()
    {
        var matchId = Guid.NewGuid();
        var match = new DomainMatch
        {
            Id = matchId,
            GameWeekId = Guid.NewGuid(),
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = DateTime.UtcNow,
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        _matchRepositoryMock.Setup(x => x.GetByIdAsync(matchId))
            .ReturnsAsync(match);

        _predictionRepositoryMock.Setup(x => x.GetByMatchIdAsync(matchId))
            .ReturnsAsync(Array.Empty<Prediction>());

        await _service.EnterResultAsync(matchId, 2, 1);

        Assert.True(match.IsFinished);
        _matchRepositoryMock.Verify(x => x.SaveChangesAsync(), Times.Once);
    }
}
