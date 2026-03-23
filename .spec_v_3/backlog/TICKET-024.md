# TICKET-024: Sync Button Integration

**Status**: BACKLOG
**Priority**: P1
**Assigned to**: Frontend Developer + Backend Developer
**Depends on**: TICKET-012, TICKET-022
**User Story**: US-009
**Complexity**: S
**Critical path**: no

## Description
Wire up header sync button to POST /matches/sync. Show loading state and reload data after completion.

## Acceptance Criteria
- [ ] Sync button in header triggers POST /matches/sync
- [ ] Loading spinner shown during sync
- [ ] Button disabled during sync (prevent double-click)
- [ ] Match data reloaded after sync completes
- [ ] Error toast if sync fails
- [ ] Success indication when complete

## Test Plan
- [ ] Unit: Button calls sync endpoint
- [ ] Unit: Button disabled during loading
- [ ] Unit: Data refreshed after sync

## Files to Create/Modify
- [ ] `frontend/src/app/shared/components/header/header.component.ts` (update)
- [ ] `frontend/src/app/core/services/match.service.ts` (add syncMatches method)
