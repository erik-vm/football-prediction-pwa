# TICKET-019: My Predictions View

**Status**: BACKLOG
**Priority**: P1
**Assigned to**: Frontend Developer
**Depends on**: TICKET-017
**User Story**: US-012
**Complexity**: S
**Critical path**: no

## Description
My Predictions page listing all user's predictions with match info, scores, and points earned.

## Acceptance Criteria
- [ ] My Predictions page at /predictions (protected route)
- [ ] Lists all user's predictions with match info
- [ ] Shows: home team, away team, predicted score, actual score (if finished), points earned
- [ ] Status display: PENDING or SCORED
- [ ] Ordered by creation date descending
- [ ] Empty state if no predictions

## Test Plan
- [ ] Unit: Renders predictions list
- [ ] Unit: Shows points for SCORED predictions
- [ ] Unit: Shows PENDING status for unscored
- [ ] Unit: Empty state displayed when no predictions

## Files to Create/Modify
- [ ] `frontend/src/app/features/predictions/my-predictions/my-predictions.component.ts`
- [ ] `frontend/src/app/features/predictions/my-predictions/my-predictions.component.html`
