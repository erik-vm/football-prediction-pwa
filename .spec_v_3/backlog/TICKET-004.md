# TICKET-004: DbContext, Entity Configs & Migration

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: DB Specialist
**Depends on**: TICKET-002, TICKET-003
**User Story**: N/A (infrastructure)
**Complexity**: L
**Critical path**: YES

## Description
Create AppDbContext with auto-timestamping in SaveChangesAsync(). Configure all entity relationships, unique constraints, and indexes. Generate initial migration via SQL script method.

## Acceptance Criteria
- [ ] AppDbContext in Infrastructure project with DbSets for all 5 entities
- [ ] SaveChangesAsync() override auto-sets CreatedAt/UpdatedAt (UTC)
- [ ] Entity configurations via IEntityTypeConfiguration<T> for each entity
- [ ] Unique constraints: (UserId, MatchId) on Prediction, (Code, Season) on Tournament, (TournamentId, WeekNumber) on GameWeek, Username on User, Email on User
- [ ] Indexes: KickoffTime on Match, Status on Match, (TournamentId, GameWeekId) on Match
- [ ] Cascade delete: User → Predictions, Match → Predictions, Tournament → Matches
- [ ] SetNull on delete: GameWeek → Matches
- [ ] Initial migration created via `dotnet ef migrations script` (ERROR #3)
- [ ] All EF packages are 9.0.x (ERROR #4)

## Test Plan
- [ ] Migration script generates valid SQL
- [ ] SQL script applies successfully to PostgreSQL
- [ ] All tables created with correct constraints
- [ ] Auto-timestamping works on insert and update

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #3 (migration method), ERROR #4 (package versions)
- NEVER use `dotnet ef database update` — use SQL script method
- Connection string in appsettings.Development.json pointing to localhost:5433

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Infrastructure/Data/AppDbContext.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Data/Configurations/UserConfiguration.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Data/Configurations/TournamentConfiguration.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Data/Configurations/GameWeekConfiguration.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Data/Configurations/MatchConfiguration.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Data/Configurations/PredictionConfiguration.cs`
