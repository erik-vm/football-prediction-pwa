# TICKET-028: Points Info Tooltip

**Status**: BACKLOG
**Priority**: P2
**Assigned to**: Frontend Developer
**Depends on**: TICKET-017
**User Story**: US-021
**Complexity**: S
**Critical path**: no

## Description
Expandable info section in prediction form showing scoring tiers from GAME-RULES.md.

## Acceptance Criteria
- [ ] Points Breakdown section in prediction form (per mockup)
- [ ] Shows: Exact score prediction +5 pts, Correct winner +3 pts, Correct goal difference +2 pts (bonus on top of winner), One score correct +1 pt, No match 0 pts
- [ ] Collapsible/expandable with info icon
- [ ] Styled with subtle background (per mockup)

## Test Plan
- [ ] Unit: Info section renders all scoring tiers
- [ ] Unit: Expand/collapse works

## Files to Create/Modify
- [ ] `frontend/src/app/features/predictions/prediction-form/prediction-form.component.html` (update)
