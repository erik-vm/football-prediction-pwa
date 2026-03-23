# TICKET-003: Domain Entities

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-001
**User Story**: N/A (infrastructure)
**Complexity**: M
**Critical path**: YES

## Description
Create all 5 entities (User, Tournament, GameWeek, Match, Prediction) in Domain project with exact properties from PROJECT-SPEC.md.

## Acceptance Criteria
- [ ] User entity with all properties from PROJECT-SPEC.md
- [ ] Tournament entity with all properties
- [ ] GameWeek entity with all properties
- [ ] Match entity with all properties (Status values: SCHEDULED, IN_PLAY, FINISHED, POSTPONED, CANCELLED)
- [ ] Prediction entity with all properties (Status values: PENDING, SCORED)
- [ ] All navigation properties are nullable (ERROR #18)
- [ ] Domain project has zero dependencies on other projects
- [ ] All DateTime properties use UTC

## Test Plan
- [ ] Solution builds with 0 errors
- [ ] Domain project has no project references
- [ ] Each entity has all properties matching PROJECT-SPEC.md

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #18 (nullable navigation properties)
- Use `string?` for nullable string properties
- Include CreatedAt/UpdatedAt on all entities

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Domain/Entities/User.cs`
- [ ] `backend/src/FootballPrediction.Domain/Entities/Tournament.cs`
- [ ] `backend/src/FootballPrediction.Domain/Entities/GameWeek.cs`
- [ ] `backend/src/FootballPrediction.Domain/Entities/Match.cs`
- [ ] `backend/src/FootballPrediction.Domain/Entities/Prediction.cs`
