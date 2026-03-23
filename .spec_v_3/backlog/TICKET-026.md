# TICKET-026: Offline Support

**Status**: BACKLOG
**Priority**: P2
**Assigned to**: Frontend Developer
**Depends on**: TICKET-025, TICKET-017
**User Story**: US-018
**Complexity**: M
**Critical path**: no

## Description
OfflineService with isOnline signal, OfflineQueueService for queuing predictions when offline, auto-sync on reconnect.

## Acceptance Criteria
- [ ] OfflineService with isOnline signal (listens to online/offline events)
- [ ] Offline indicator shown in UI when disconnected
- [ ] OfflineQueueService: queues predictions in localStorage when offline
- [ ] Auto-syncs queued predictions when connection restored
- [ ] Failed sync (match already kicked off) shows notification to user
- [ ] Conflict handling: 409 errors (duplicate) show error and discard offline copy

## Test Plan
- [ ] Unit: isOnline signal updates on network change
- [ ] Unit: Predictions queued when offline
- [ ] Unit: Queue synced on reconnect
- [ ] Unit: Failed predictions show error notification

## Files to Create/Modify
- [ ] `frontend/src/app/core/services/offline.service.ts`
- [ ] `frontend/src/app/core/services/offline-queue.service.ts`
