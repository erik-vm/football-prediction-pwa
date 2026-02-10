using FootballPrediction.Domain.Entities;
using FootballPrediction.Domain.Enums;
using FootballPrediction.Infrastructure.Data;
using FootballPrediction.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.UnitTests.Repositories;

public class MatchRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly MatchRepository _repository;
    private readonly Guid _tournamentId;
    private readonly Guid _gameWeekId;

    public MatchRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new MatchRepository(_context);

        _tournamentId = Guid.NewGuid();
        var tournament = new Tournament
        {
            Id = _tournamentId,
            Name = "Test Tournament",
            Season = "2024",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2024, 6, 1),
            IsActive = true
        };

        _gameWeekId = Guid.NewGuid();
        var gameWeek = new GameWeek
        {
            Id = _gameWeekId,
            TournamentId = _tournamentId,
            WeekNumber = 1,
            StartDate = new DateTime(2024, 1, 8),
            EndDate = new DateTime(2024, 1, 14)
        };

        _context.Tournaments.Add(tournament);
        _context.GameWeeks.Add(gameWeek);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByGameWeekIdAsync_ReturnsMatches_OrderedByKickoffTime()
    {
        var match1 = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = new DateTime(2024, 1, 10, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        var match2 = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team C",
            AwayTeam = "Team D",
            KickoffTime = new DateTime(2024, 1, 9, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        await _context.Matches.AddRangeAsync(match1, match2);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByGameWeekIdAsync(_gameWeekId);

        var matches = result.ToList();
        Assert.Equal(2, matches.Count);
        Assert.Equal(match2.Id, matches[0].Id);
        Assert.Equal(match1.Id, matches[1].Id);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsCorrectMatch()
    {
        var match = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = new DateTime(2024, 1, 10, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        await _context.Matches.AddAsync(match);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(match.Id);

        Assert.NotNull(result);
        Assert.Equal(match.Id, result.Id);
        Assert.Equal(match.HomeTeam, result.HomeTeam);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetUpcomingAsync_ReturnsOnlyUpcomingMatches()
    {
        var futureMatch = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = DateTime.UtcNow.AddDays(1),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        var pastMatch = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team C",
            AwayTeam = "Team D",
            KickoffTime = DateTime.UtcNow.AddDays(-1),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        var finishedMatch = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team E",
            AwayTeam = "Team F",
            KickoffTime = DateTime.UtcNow.AddDays(2),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = true
        };

        await _context.Matches.AddRangeAsync(futureMatch, pastMatch, finishedMatch);
        await _context.SaveChangesAsync();

        var result = await _repository.GetUpcomingAsync();

        var matches = result.ToList();
        Assert.Single(matches);
        Assert.Equal(futureMatch.Id, matches[0].Id);
    }

    [Fact]
    public async Task GetFinishedAsync_ReturnsOnlyFinishedMatches_OrderedByKickoffDescending()
    {
        var finishedMatch1 = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = new DateTime(2024, 1, 10, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = true,
            HomeScore = 2,
            AwayScore = 1
        };

        var finishedMatch2 = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team C",
            AwayTeam = "Team D",
            KickoffTime = new DateTime(2024, 1, 11, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = true,
            HomeScore = 1,
            AwayScore = 1
        };

        var unfinishedMatch = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team E",
            AwayTeam = "Team F",
            KickoffTime = new DateTime(2024, 1, 12, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        await _context.Matches.AddRangeAsync(finishedMatch1, finishedMatch2, unfinishedMatch);
        await _context.SaveChangesAsync();

        var result = await _repository.GetFinishedAsync();

        var matches = result.ToList();
        Assert.Equal(2, matches.Count);
        Assert.Equal(finishedMatch2.Id, matches[0].Id);
        Assert.Equal(finishedMatch1.Id, matches[1].Id);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsTrue_WhenMatchExists()
    {
        var match = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = new DateTime(2024, 1, 10, 15, 0, 0),
            Stage = TournamentStage.GROUP_STAGE,
            IsFinished = false
        };

        await _context.Matches.AddAsync(match);
        await _context.SaveChangesAsync();

        var result = await _repository.ExistsAsync(match.Id);

        Assert.True(result);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsFalse_WhenMatchDoesNotExist()
    {
        var result = await _repository.ExistsAsync(Guid.NewGuid());

        Assert.False(result);
    }

    [Fact]
    public void StageMultiplier_ReturnsCorrectValue()
    {
        var match = new Match
        {
            Id = Guid.NewGuid(),
            GameWeekId = _gameWeekId,
            HomeTeam = "Team A",
            AwayTeam = "Team B",
            KickoffTime = new DateTime(2024, 1, 10, 15, 0, 0),
            Stage = TournamentStage.FINAL,
            IsFinished = false
        };

        Assert.Equal(5, match.StageMultiplier);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
