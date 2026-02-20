using FootballPrediction.Domain.Entities;
using FootballPrediction.Domain.Enums;
using FootballPrediction.Infrastructure.Data;
using FootballPrediction.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.UnitTests.Repositories;

public class PredictionRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly PredictionRepository _repository;
    private readonly Guid _userId;
    private readonly Guid _matchId;

    public PredictionRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new PredictionRepository(_context);

        _userId = Guid.NewGuid();
        var user = new User
        {
            Id = _userId,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.USER
        };

        var tournamentId = Guid.NewGuid();
        var tournament = new Tournament
        {
            Id = tournamentId,
            Name = "Test Tournament",
            Season = "2024",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2024, 6, 1),
            IsActive = true
        };

        var gameWeekId = Guid.NewGuid();
        var gameWeek = new GameWeek
        {
            Id = gameWeekId,
            TournamentId = tournamentId,
            WeekNumber = 1,
            StartDate = new DateTime(2024, 1, 8),
            EndDate = new DateTime(2024, 1, 14)
        };

        _matchId = Guid.NewGuid();
        var match = new Match
        {
            Id = _matchId,
            GameWeekId = gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = DateTime.UtcNow.AddDays(1),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        _context.Users.Add(user);
        _context.Tournaments.Add(tournament);
        _context.GameWeeks.Add(gameWeek);
        _context.Matches.Add(match);
        _context.SaveChanges();
    }

    [Fact]
    public async Task CreateAsync_AddsNewPrediction()
    {
        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 2,
            AwayScore = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _repository.CreateAsync(prediction);
        await _repository.SaveChangesAsync();

        var saved = await _context.Predictions.FindAsync(prediction.Id);
        Assert.NotNull(saved);
        Assert.Equal(prediction.Id, saved.Id);
        Assert.Equal(2, saved.HomeScore);
        Assert.Equal(1, saved.AwayScore);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsPrediction_WithMatchAndUser()
    {
        var predictionId = Guid.NewGuid();
        var prediction = new Prediction
        {
            Id = predictionId,
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 3,
            AwayScore = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Predictions.Add(prediction);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(predictionId);

        Assert.NotNull(result);
        Assert.Equal(predictionId, result.Id);
        Assert.NotNull(result.Match);
        Assert.NotNull(result.User);
        Assert.Equal("Team A", result.Match.HomeTeam);
        Assert.Equal("testuser", result.User.Username);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByUserAndMatchAsync_ReturnsPrediction_WhenExists()
    {
        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 1,
            AwayScore = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Predictions.Add(prediction);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByUserAndMatchAsync(_userId, _matchId);

        Assert.NotNull(result);
        Assert.Equal(prediction.Id, result.Id);
        Assert.NotNull(result.Match);
    }

    [Fact]
    public async Task GetByUserAndMatchAsync_ReturnsNull_WhenNotFound()
    {
        var result = await _repository.GetByUserAndMatchAsync(Guid.NewGuid(), _matchId);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsUserPredictions_OrderedByKickoffTimeDescending()
    {
        var match2Id = Guid.NewGuid();
        var match2 = new Match
        {
            Id = match2Id,
            GameWeekId = _context.GameWeeks.First().Id,
            HomeTeam = "Team C",
            AwayTeam = "Team D",
            KickoffTime = DateTime.UtcNow.AddDays(2),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };
        _context.Matches.Add(match2);

        var prediction1 = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 2,
            AwayScore = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var prediction2 = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = match2Id,
            HomeScore = 1,
            AwayScore = 2,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Predictions.AddRange(prediction1, prediction2);
        await _context.SaveChangesAsync();

        var result = (await _repository.GetByUserIdAsync(_userId)).ToList();

        Assert.Equal(2, result.Count);
        Assert.NotNull(result[0].Match);
        Assert.NotNull(result[0].Match.GameWeek);
        Assert.True(result[0].Match.KickoffTime >= result[1].Match.KickoffTime);
    }

    [Fact]
    public async Task GetByMatchIdAsync_ReturnsAllPredictionsForMatch()
    {
        var user2Id = Guid.NewGuid();
        var user2 = new User
        {
            Id = user2Id,
            Username = "testuser2",
            Email = "test2@example.com",
            PasswordHash = "hashedpassword",
            Role = UserRole.USER
        };
        _context.Users.Add(user2);

        var prediction1 = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 2,
            AwayScore = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var prediction2 = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = user2Id,
            MatchId = _matchId,
            HomeScore = 1,
            AwayScore = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Predictions.AddRange(prediction1, prediction2);
        await _context.SaveChangesAsync();

        var result = (await _repository.GetByMatchIdAsync(_matchId)).ToList();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, p => p.UserId == _userId);
        Assert.Contains(result, p => p.UserId == user2Id);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesPrediction_AndSetsUpdatedAt()
    {
        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 1,
            AwayScore = 0,
            CreatedAt = DateTime.UtcNow.AddHours(-1),
            UpdatedAt = DateTime.UtcNow.AddHours(-1)
        };

        _context.Predictions.Add(prediction);
        await _context.SaveChangesAsync();

        var originalUpdatedAt = prediction.UpdatedAt;

        await Task.Delay(100);

        prediction.HomeScore = 3;
        prediction.AwayScore = 2;
        await _repository.UpdateAsync(prediction);
        await _repository.SaveChangesAsync();

        var updated = await _context.Predictions.FindAsync(prediction.Id);
        Assert.NotNull(updated);
        Assert.Equal(3, updated.HomeScore);
        Assert.Equal(2, updated.AwayScore);
        Assert.True(updated.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public async Task DeleteAsync_RemovesPrediction()
    {
        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            MatchId = _matchId,
            HomeScore = 2,
            AwayScore = 2,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Predictions.Add(prediction);
        await _context.SaveChangesAsync();

        await _repository.DeleteAsync(prediction);
        await _repository.SaveChangesAsync();

        var deleted = await _context.Predictions.FindAsync(prediction.Id);
        Assert.Null(deleted);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
