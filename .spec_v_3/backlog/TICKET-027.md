# TICKET-027: Dark/Light Theme Toggle

**Status**: BACKLOG
**Priority**: P2
**Assigned to**: Frontend Developer
**Depends on**: TICKET-022
**User Story**: US-019
**Complexity**: S
**Critical path**: no

## Description
Theme toggle in header. Persist to localStorage. Apply Tailwind dark mode class.

## Acceptance Criteria
- [ ] Theme toggle button in header (sun/moon icon)
- [ ] Click toggles between dark and light mode
- [ ] Theme persisted to localStorage
- [ ] Tailwind dark mode class applied to document root
- [ ] All components respect dark/light theme
- [ ] Default: light mode (or system preference)

## Test Plan
- [ ] Unit: Toggle switches theme
- [ ] Unit: Theme persisted to localStorage
- [ ] Unit: Dark mode class applied to document

## Files to Create/Modify
- [ ] `frontend/src/app/shared/components/header/header.component.ts` (update)
- [ ] `frontend/tailwind.config.js` (dark mode config)
