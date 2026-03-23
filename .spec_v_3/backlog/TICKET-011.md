# TICKET-011: Leaderboard Service

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-010
**User Story**: US-014
**Complexity**: M
**Critical path**: YES

## Description
LeaderboardService computed on-demand: group predictions by user, sum points, count predictions, calculate average. Three-level tie-breaking per GAME-RULES.md.

## Acceptance Criteria
- [ ] ILeaderboardService interface in Application
- [ ] LeaderboardService in Infrastructure
- [ ] LeaderboardController at /api/v1/leaderboard
- [ ] GET /overall/{tournamentId} returns leaderboard for tournament
- [ ] GET /competition/{competitionCode} returns leaderboard for competition
- [ ] LeaderboardEntry DTO: userId, username, totalPoints, totalPredictions, averagePoints, rank
- [ ] Ranking: DESC by totalPoints, then DESC by totalPredictions, then DESC by averagePoints
- [ ] Accuracy formula: (totalPoints / (totalPredictions * 5)) * 100
- [ ] Only counts SCORED predictions

## Test Plan
- [ ] Unit: Groups predictions by user correctly
- [ ] Unit: Sums points and counts predictions correctly
- [ ] Unit: Ranks by points descending
- [ ] Unit: Tie-break by predictions count, then average
- [ ] Unit: Accuracy calculation is correct
- [ ] Unit: Only SCORED predictions included

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/DTOs/LeaderboardEntryDto.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/ILeaderboardService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/LeaderboardService.cs`
- [ ] `backend/src/FootballPrediction.Api/Controllers/LeaderboardController.cs`
