# TICKET-005: Repository Interfaces & Implementations

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-004
**User Story**: N/A (infrastructure)
**Complexity**: M
**Critical path**: YES

## Description
Create generic IRepository<T> interface and specific repository interfaces/implementations for each aggregate root. Register in DI container.

## Acceptance Criteria
- [ ] IRepository<T> generic interface in Application project with: GetByIdAsync, GetAllAsync, AddAsync, UpdateAsync, DeleteAsync
- [ ] IUserRepository, ITournamentRepository, IMatchRepository, IPredictionRepository, IGameWeekRepository in Application
- [ ] Concrete implementations in Infrastructure using AppDbContext
- [ ] All repositories registered in DI container (scoped lifetime)
- [ ] IMatchRepository: GetUpcomingAsync, GetFinishedAsync, GetFilteredAsync, GetCompetitionsAsync, GetMatchdaysAsync, GetNearestMatchdayAsync
- [ ] IPredictionRepository: GetByUserAsync, GetByMatchAndUserAsync, GetPendingByMatchAsync
- [ ] All data access is async

## Test Plan
- [ ] Solution builds with 0 errors
- [ ] DI container resolves all repository interfaces
- [ ] Repository methods use EF Core correctly (no N+1, AsNoTracking for reads)

## Technical Notes
- Interfaces in Application/Interfaces/Repositories/
- Implementations in Infrastructure/Repositories/
- Never expose DbContext directly to controllers or services

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Repositories/IRepository.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Repositories/IUserRepository.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Repositories/ITournamentRepository.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Repositories/IMatchRepository.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Repositories/IPredictionRepository.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Repositories/IGameWeekRepository.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Repositories/` (implementations)
- [ ] `backend/src/FootballPrediction.Api/Program.cs` (DI registration)
