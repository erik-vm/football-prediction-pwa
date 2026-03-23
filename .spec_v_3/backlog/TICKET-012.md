# TICKET-012: Football-Data.org Sync Service

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-008, TICKET-009
**User Story**: US-022
**Complexity**: L
**Critical path**: YES

## Description
FootballDataService for syncing match data from football-data.org v4 API. Handles all 12 competitions, rate limiting, idempotent upsert, tournament auto-creation.

## Acceptance Criteria
- [ ] IFootballDataService interface in Application
- [ ] FootballDataService in Infrastructure
- [ ] SyncAllCompetitionsAsync: syncs all 12 competitions
- [ ] SyncCompetitionMatchesAsync: syncs single competition
- [ ] Rate limit: 6.5s delay between competition API requests
- [ ] Idempotent upsert by (CompetitionCode, HomeTeam, AwayTeam, Matchday) — ERROR #17
- [ ] Creates Tournament if not exists (by Code + Season)
- [ ] Updates match scores and status when FINISHED
- [ ] Calls ScorePendingPredictionsAsync after score updates — ERROR #16
- [ ] CleanupDuplicatesAsync removes duplicate matches
- [ ] POST /matches/sync endpoint triggers full sync
- [ ] API key from environment variable (X-Auth-Token header)
- [ ] Handles API errors gracefully (429, 500, timeout)
- [ ] Competitions: PL, PD, BL1, SA, FL1, CL, PPL, DED, ELC, BSA, WC, EC

## Test Plan
- [ ] Unit: Match mapping from API response to entity
- [ ] Unit: Duplicate detection by composite key
- [ ] Unit: Tournament created when not exists
- [ ] Unit: Existing match updated (not duplicated)
- [ ] Unit: Scoring triggered after sync

## Technical Notes
- HIGH RISK TICKET: ERROR #16 (scoring gap) and ERROR #17 (duplicates) are the most common issues
- football-data.org API v4 docs: https://www.football-data.org/documentation/api
- Free tier: 10 requests/minute
- Test with single competition first (PL) before full sync

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IFootballDataService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/FootballDataService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Models/FootballDataApiModels.cs`
