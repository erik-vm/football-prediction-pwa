# TICKET-021: Preferences View (Competition Selection)

**Status**: BACKLOG
**Priority**: P1
**Assigned to**: Frontend Developer
**Depends on**: TICKET-014
**User Story**: US-016
**Complexity**: S
**Critical path**: no

## Description
Preferences page with competition checkboxes persisted to localStorage. Filters match list and leaderboard.

## Acceptance Criteria
- [ ] Preferences page at /preferences (protected route)
- [ ] User info display (avatar placeholder, username)
- [ ] "Selected Competitions" section with checkboxes for all 12 competitions
- [ ] Competition full names shown (PL → Premier League, etc.)
- [ ] Selection persisted to localStorage
- [ ] Default for new users: all competitions selected
- [ ] Match list filters by selected competitions
- [ ] Leaderboard filters by selected competitions
- [ ] UI matches user_settings_view.png mockup

## Test Plan
- [ ] Unit: All 12 competitions shown
- [ ] Unit: Checkbox state persisted to localStorage
- [ ] Unit: Default state is all selected
- [ ] Unit: Match list respects preferences

## Files to Create/Modify
- [ ] `frontend/src/app/features/preferences/preferences/preferences.component.ts`
- [ ] `frontend/src/app/features/preferences/preferences/preferences.component.html`
