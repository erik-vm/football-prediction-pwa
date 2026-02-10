using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using FootballPrediction.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.UnitTests.Repositories;

public class TournamentRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly TournamentRepository _repository;

    public TournamentRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new TournamentRepository(_context);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsTournaments_OrderedByStartDateDescending()
    {
        var tournament1 = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = "Tournament 1",
            Season = "2024",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2024, 6, 1),
            IsActive = false
        };

        var tournament2 = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = "Tournament 2",
            Season = "2025",
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 6, 1),
            IsActive = true
        };

        await _context.Tournaments.AddRangeAsync(tournament1, tournament2);
        await _context.SaveChangesAsync();

        var result = await _repository.GetAllAsync();

        var tournaments = result.ToList();
        Assert.Equal(2, tournaments.Count);
        Assert.Equal(tournament2.Id, tournaments[0].Id);
        Assert.Equal(tournament1.Id, tournaments[1].Id);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsCorrectTournament()
    {
        var tournament = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = "Test Tournament",
            Season = "2024",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2024, 6, 1),
            IsActive = true
        };

        await _context.Tournaments.AddAsync(tournament);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(tournament.Id);

        Assert.NotNull(result);
        Assert.Equal(tournament.Id, result.Id);
        Assert.Equal(tournament.Name, result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetActiveAsync_ReturnsActiveTournament()
    {
        var tournament1 = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = "Inactive Tournament",
            Season = "2024",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2024, 6, 1),
            IsActive = false
        };

        var tournament2 = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = "Active Tournament",
            Season = "2025",
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 6, 1),
            IsActive = true
        };

        await _context.Tournaments.AddRangeAsync(tournament1, tournament2);
        await _context.SaveChangesAsync();

        var result = await _repository.GetActiveAsync();

        Assert.NotNull(result);
        Assert.Equal(tournament2.Id, result.Id);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsTrue_WhenTournamentExists()
    {
        var tournament = new Tournament
        {
            Id = Guid.NewGuid(),
            Name = "Test Tournament",
            Season = "2024",
            StartDate = new DateTime(2024, 1, 1),
            EndDate = new DateTime(2024, 6, 1),
            IsActive = true
        };

        await _context.Tournaments.AddAsync(tournament);
        await _context.SaveChangesAsync();

        var result = await _repository.ExistsAsync(tournament.Id);

        Assert.True(result);
    }

    [Fact]
    public async Task ExistsAsync_ReturnsFalse_WhenTournamentDoesNotExist()
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
