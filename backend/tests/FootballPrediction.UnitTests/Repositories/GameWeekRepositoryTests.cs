using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using FootballPrediction.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.UnitTests.Repositories;

public class GameWeekRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly GameWeekRepository _repository;
    private readonly Guid _tournamentId;

    public GameWeekRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new GameWeekRepository(_context);

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
        _context.Tournaments.Add(tournament);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByTournamentIdAsync_ReturnsGameWeeks_OrderedByWeekNumber()
    {
        var gameWeek1 = new GameWeek
        {
            Id = Guid.NewGuid(),
            TournamentId = _tournamentId,
            WeekNumber = 2,
            StartDate = new DateTime(2024, 1, 15),
            EndDate = new DateTime(2024, 1, 21)
        };

        var gameWeek2 = new GameWeek
        {
            Id = Guid.NewGuid(),
            TournamentId = _tournamentId,
            WeekNumber = 1,
            StartDate = new DateTime(2024, 1, 8),
            EndDate = new DateTime(2024, 1, 14)
        };

        await _context.GameWeeks.AddRangeAsync(gameWeek1, gameWeek2);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByTournamentIdAsync(_tournamentId);

        var gameWeeks = result.ToList();
        Assert.Equal(2, gameWeeks.Count);
        Assert.Equal(1, gameWeeks[0].WeekNumber);
        Assert.Equal(2, gameWeeks[1].WeekNumber);
    }

    [Fact]
    public async Task GetByTournamentIdAsync_ReturnsEmpty_WhenNoGameWeeksExist()
    {
        var result = await _repository.GetByTournamentIdAsync(_tournamentId);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsCorrectGameWeek()
    {
        var gameWeek = new GameWeek
        {
            Id = Guid.NewGuid(),
            TournamentId = _tournamentId,
            WeekNumber = 1,
            StartDate = new DateTime(2024, 1, 8),
            EndDate = new DateTime(2024, 1, 14)
        };

        await _context.GameWeeks.AddAsync(gameWeek);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(gameWeek.Id);

        Assert.NotNull(result);
        Assert.Equal(gameWeek.Id, result.Id);
        Assert.Equal(gameWeek.WeekNumber, result.WeekNumber);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsTrue_WhenGameWeekExists()
    {
        var gameWeek = new GameWeek
        {
            Id = Guid.NewGuid(),
            TournamentId = _tournamentId,
            WeekNumber = 1,
            StartDate = new DateTime(2024, 1, 8),
            EndDate = new DateTime(2024, 1, 14)
        };

        await _context.GameWeeks.AddAsync(gameWeek);
        await _context.SaveChangesAsync();

        var result = await _repository.ExistsAsync(gameWeek.Id);

        Assert.True(result);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsFalse_WhenGameWeekDoesNotExist()
    {
        var result = await _repository.ExistsAsync(Guid.NewGuid());

        Assert.False(result);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
