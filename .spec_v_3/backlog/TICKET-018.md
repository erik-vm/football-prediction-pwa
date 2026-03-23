# TICKET-018: Leaderboard UI

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Frontend Developer
**Depends on**: TICKET-014, TICKET-011
**User Story**: US-014
**Complexity**: M
**Critical path**: no

## Description
Leaderboard page with competition selector, user stats card, and ranked user list with medals.

## Acceptance Criteria
- [ ] Leaderboard page at /leaderboard (protected route)
- [ ] Competition selector dropdown
- [ ] "Your Stats" card at top: rank, points, predictions count, accuracy %
- [ ] Rank badge (#1, #2, etc.) in cyan
- [ ] Stats card with icons for points, predictions, accuracy
- [ ] Ranked user list below stats card
- [ ] Top 3 get medal indicators (gold trophy, silver, bronze)
- [ ] Each row shows: medal/rank, username, predictions count, accuracy %, total points
- [ ] Current user's row highlighted
- [ ] Cyan/teal gradient on stats card (per mockup)
- [ ] LeaderboardService with API calls
- [ ] UI matches leaderboard_view.png mockup

## Test Plan
- [ ] Unit: Stats card shows current user's data
- [ ] Unit: Users ranked correctly
- [ ] Unit: Top 3 show medal icons
- [ ] Unit: Current user row highlighted
- [ ] Unit: Competition filter changes leaderboard data

## Files to Create/Modify
- [ ] `frontend/src/app/features/leaderboard/leaderboard/leaderboard.component.ts`
- [ ] `frontend/src/app/features/leaderboard/leaderboard/leaderboard.component.html`
- [ ] `frontend/src/app/core/services/leaderboard.service.ts`
- [ ] `frontend/src/app/shared/models/leaderboard.model.ts`
