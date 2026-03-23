# TICKET-007: Scoring Service + Unit Tests

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer + QA Engineer
**Depends on**: TICKET-001
**User Story**: US-013
**Complexity**: M
**Critical path**: YES

## Description
Implement ScoringService.CalculatePoints() per GAME-RULES.md reference implementation. Write all 12+ test cases. Pure logic service with zero dependencies.

## Acceptance Criteria
- [ ] IScoringService interface in Application project
- [ ] ScoringService implementation in Infrastructure project
- [ ] CalculatePoints(predictedHome, predictedAway, actualHome, actualAway) returns correct points
- [ ] Rules checked in strict order: exact match (5) → same winner + same diff (4) → same winner (3) → one score correct (1) → no match (0)
- [ ] Draw always has diff=0, matching draw = 4 points (Rule 2)
- [ ] Rule 4 only triggers when winner prediction is wrong
- [ ] All 12 test cases from GAME-RULES.md pass
- [ ] Registered in DI container

## Test Plan
- [ ] 2-1 vs 2-1 → 5 (exact match)
- [ ] 0-0 vs 0-0 → 5 (exact draw)
- [ ] 3-1 vs 2-0 → 4 (same winner, same diff)
- [ ] 1-1 vs 2-2 → 4 (both draws, diff=0)
- [ ] 2-0 vs 1-0 → 3 (same winner, diff differs)
- [ ] 0-1 vs 0-3 → 3 (same winner away, diff differs)
- [ ] 1-1 vs 0-0 → 4 (both draws)
- [ ] 2-1 vs 3-0 → 3 (same winner, diff differs)
- [ ] 2-1 vs 2-0 → 1 (home score correct, wrong diff)
- [ ] 1-3 vs 2-3 → 1 (away score correct, wrong winner)
- [ ] 2-1 vs 0-3 → 0 (wrong everything)
- [ ] 3-0 vs 0-1 → 0 (wrong winner, wrong scores)

## Technical Notes
- This ticket can be built in parallel with DB work (TICKET-002/003/004) since it has zero DB dependencies
- Reference implementation is in GAME-RULES.md — use Math.Sign for winner comparison
- GAME-RULES.md is FROZEN — do not modify the algorithm

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IScoringService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/ScoringService.cs`
- [ ] `backend/tests/FootballPrediction.Tests/Services/ScoringServiceTests.cs`
