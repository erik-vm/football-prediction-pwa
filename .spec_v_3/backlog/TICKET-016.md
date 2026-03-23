# TICKET-016: Match List UI (Tabs, Filters, Cards)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Frontend Developer
**Depends on**: TICKET-015, TICKET-009
**User Story**: US-005, US-006, US-007, US-008
**Complexity**: L
**Critical path**: YES

## Description
Match list page with three tabs, competition/matchday filters, and match cards. Core navigation of the app.

## Acceptance Criteria
- [ ] Match list page at /matches (protected route)
- [ ] Three tabs: Upcoming | Live | Completed (with match counts)
- [ ] Competition selector dropdown (filtered by user preferences)
- [ ] Matchday filter dropdown
- [ ] Auto-selects nearest matchday for active tab
- [ ] Upcoming tab: future unfinished matches, ordered by kickoff ASC
- [ ] Live tab: IN_PLAY matches with current scores, LIVE red badge
- [ ] Completed tab: finished matches with scores, FINISHED gray badge, ordered by kickoff DESC
- [ ] Match cards show: teams, kickoff time/score, status badge, team logos placeholder
- [ ] Match cards show existing prediction if exists ("Your prediction: 2-0")
- [ ] "Make Prediction" button on upcoming match cards → navigates to prediction form
- [ ] MatchService with all API calls
- [ ] Competition dropdown shows as dark overlay (per mockup)
- [ ] Matchday dropdown shows scrollable list (per mockup)
- [ ] Cyan accent for active tab and buttons
- [ ] UI matches upcoming_games_view.png, completed_games_view.png, live_games_view.png mockups

## Test Plan
- [ ] Unit: Correct tab shows correct matches
- [ ] Unit: Competition filter updates match list
- [ ] Unit: Matchday filter updates match list
- [ ] Unit: Match card renders correctly for each status
- [ ] Unit: Prediction button navigates with matchId

## Files to Create/Modify
- [ ] `frontend/src/app/features/matches/match-list/match-list.component.ts`
- [ ] `frontend/src/app/features/matches/match-list/match-list.component.html`
- [ ] `frontend/src/app/features/matches/match-card/match-card.component.ts`
- [ ] `frontend/src/app/features/matches/match-card/match-card.component.html`
- [ ] `frontend/src/app/core/services/match.service.ts`
- [ ] `frontend/src/app/shared/models/match.model.ts`
