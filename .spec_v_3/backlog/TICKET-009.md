# TICKET-009: Match CRUD + Filtering Endpoints

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-005
**User Story**: US-005, US-006, US-007, US-008
**Complexity**: L
**Critical path**: YES

## Description
MatchService + MatchController with full CRUD and all filtering endpoints. MatchResultService for manual result entry that triggers scoring.

## Acceptance Criteria
- [ ] IMatchService interface in Application
- [ ] MatchService in Infrastructure
- [ ] MatchController at /api/v1/matches
- [ ] GET / returns all matches
- [ ] GET /{id} returns match or 404
- [ ] GET /upcoming returns future unfinished matches, ordered by kickoff ASC
- [ ] GET /finished returns finished matches, ordered by kickoff DESC
- [ ] GET /filtered?competitionCode&matchday returns filtered matches
- [ ] GET /competitions returns distinct competition codes
- [ ] GET /matchdays?competitionCode returns distinct matchdays
- [ ] GET /nearest-matchday?competitionCode&tab returns nearest matchday for tab type
- [ ] POST / creates match
- [ ] PUT /{id} updates match
- [ ] DELETE /{id} deletes match
- [ ] POST /{id}/result sets score, marks finished, triggers scoring of pending predictions
- [ ] POST /cleanup-duplicates removes duplicate matches
- [ ] Returns DTOs, not raw entities
- [ ] Health endpoint: GET /health returns 200

## Test Plan
- [ ] Unit: GetUpcoming returns only future unfinished matches
- [ ] Unit: GetFinished returns only finished matches, desc order
- [ ] Unit: GetFiltered with competition code filters correctly
- [ ] Unit: GetNearestMatchday returns correct matchday for "upcoming" tab
- [ ] Unit: GetNearestMatchday returns correct matchday for "completed" tab
- [ ] Unit: ProcessResult sets scores and triggers scoring

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/DTOs/MatchDto.cs`
- [ ] `backend/src/FootballPrediction.Application/DTOs/MatchResultRequest.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IMatchService.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IMatchResultService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/MatchService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/MatchResultService.cs`
- [ ] `backend/src/FootballPrediction.Api/Controllers/MatchController.cs`
