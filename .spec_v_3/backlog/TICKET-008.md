# TICKET-008: Tournament CRUD

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-005
**User Story**: US-015
**Complexity**: S
**Critical path**: no

## Description
TournamentService + TournamentController with full CRUD. Return DTOs, not entities.

## Acceptance Criteria
- [ ] ITournamentService interface in Application
- [ ] TournamentService in Infrastructure
- [ ] TournamentController at /api/v1/tournaments
- [ ] GET / returns all tournaments
- [ ] GET /{id} returns single tournament or 404
- [ ] POST / creates tournament, returns created
- [ ] PUT /{id} updates tournament, returns 204
- [ ] DELETE /{id} deletes tournament, returns 204
- [ ] Returns DTOs, not raw entities
- [ ] Registered in DI

## Test Plan
- [ ] Unit: GetAll returns all tournaments
- [ ] Unit: GetById returns tournament or null
- [ ] Unit: Create saves and returns tournament
- [ ] Unit: Update modifies existing tournament

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/DTOs/TournamentDto.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/ITournamentService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/TournamentService.cs`
- [ ] `backend/src/FootballPrediction.Api/Controllers/TournamentController.cs`
