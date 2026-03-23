# TICKET-022: Header Component

**Status**: BACKLOG
**Priority**: P1
**Assigned to**: Frontend Developer
**Depends on**: TICKET-015
**User Story**: US-009, US-020
**Complexity**: S
**Critical path**: no

## Description
Header component for logged-in pages with app title, sync button placeholder, theme toggle placeholder, and logout button.

## Acceptance Criteria
- [ ] Header shown on all pages when logged in
- [ ] App title "Football Prediction Game" links to /matches
- [ ] Theme toggle icon (placeholder — wired in TICKET-027)
- [ ] Logout icon/button → calls AuthService.logout()
- [ ] Sync button placeholder (wired in TICKET-024)
- [ ] Dark header background (per mockup)
- [ ] Bold white text for title
- [ ] Hidden on /login and /register pages

## Test Plan
- [ ] Unit: Title links to /matches
- [ ] Unit: Logout button calls logout
- [ ] Unit: Hidden when not authenticated

## Files to Create/Modify
- [ ] `frontend/src/app/shared/components/header/header.component.ts`
- [ ] `frontend/src/app/shared/components/header/header.component.html`
