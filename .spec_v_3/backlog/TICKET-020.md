# TICKET-020: Tournaments View

**Status**: BACKLOG
**Priority**: P1
**Assigned to**: Frontend Developer
**Depends on**: TICKET-014, TICKET-008
**User Story**: US-015
**Complexity**: S
**Critical path**: no

## Description
Tournaments page with tournament cards linking to matches and leaderboard.

## Acceptance Criteria
- [ ] Tournaments page at /tournaments (protected route)
- [ ] Tournament cards with: name, season, type (LEAGUE/CUP)
- [ ] "View Matches" button → navigates to /matches with competition filter
- [ ] "Leaderboard" button → navigates to /leaderboard with competition filter
- [ ] TournamentService with API calls
- [ ] Empty state if no tournaments

## Test Plan
- [ ] Unit: Renders tournament cards
- [ ] Unit: Navigation buttons work correctly
- [ ] Unit: Empty state displayed when no tournaments

## Files to Create/Modify
- [ ] `frontend/src/app/features/tournaments/tournament-list/tournament-list.component.ts`
- [ ] `frontend/src/app/features/tournaments/tournament-list/tournament-list.component.html`
- [ ] `frontend/src/app/core/services/tournament.service.ts`
- [ ] `frontend/src/app/shared/models/tournament.model.ts`
