# TICKET-023: Bottom Navigation (Mobile)

**Status**: BACKLOG
**Priority**: P1
**Assigned to**: Frontend Developer
**Depends on**: TICKET-014
**User Story**: US-020
**Complexity**: S
**Critical path**: no

## Description
Bottom navigation bar for mobile with icons for main sections.

## Acceptance Criteria
- [ ] Bottom nav shown on all pages when logged in
- [ ] 3 navigation items (per mockup): Matches (football icon), Leaderboard (chart icon), Profile/Settings (person icon)
- [ ] Active tab highlighted (blue/cyan)
- [ ] Icons for each tab
- [ ] Hidden on /login and /register pages
- [ ] Fixed at bottom of screen
- [ ] White background with subtle top border
- [ ] Navigates to correct routes on tap

## Test Plan
- [ ] Unit: All nav items rendered with icons
- [ ] Unit: Active route highlighted
- [ ] Unit: Navigation works correctly
- [ ] Unit: Hidden when not authenticated

## Files to Create/Modify
- [ ] `frontend/src/app/shared/components/bottom-nav/bottom-nav.component.ts`
- [ ] `frontend/src/app/shared/components/bottom-nav/bottom-nav.component.html`
