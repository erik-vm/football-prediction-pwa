using FootballPrediction.Application.Interfaces;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FootballPrediction.Infrastructure.Repositories;

public class TournamentRepository : ITournamentRepository
{
    private readonly ApplicationDbContext _context;

    public TournamentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Tournament>> GetAllAsync()
    {
        return await _context.Tournaments
            .OrderByDescending(t => t.StartDate)
            .ToListAsync();
    }

    public async Task<Tournament?> GetByIdAsync(Guid id)
    {
        return await _context.Tournaments
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Tournament?> GetActiveAsync()
    {
        return await _context.Tournaments
            .FirstOrDefaultAsync(t => t.IsActive);
    }

    public async Task AddAsync(Tournament tournament)
    {
        await _context.Tournaments.AddAsync(tournament);
    }

    public async Task UpdateAsync(Tournament tournament)
    {
        _context.Tournaments.Update(tournament);
    }

    public async Task DeleteAsync(Tournament tournament)
    {
        _context.Tournaments.Remove(tournament);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Tournaments.AnyAsync(t => t.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
