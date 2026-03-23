# TICKET-025: PWA Setup (Manifest + Service Worker)

**Status**: BACKLOG
**Priority**: P2
**Assigned to**: Frontend Developer + DevOps Engineer
**Depends on**: TICKET-014
**User Story**: US-017
**Complexity**: M
**Critical path**: no

## Description
Add @angular/pwa, configure web manifest with app name/icons/theme, register service worker, cache static assets.

## Acceptance Criteria
- [ ] @angular/pwa added to project
- [ ] Web manifest configured: app name "Football Prediction Game", theme color, icons
- [ ] Service worker registered
- [ ] Static assets cached for offline access
- [ ] App installable from mobile browser
- [ ] App icon on home screen

## Test Plan
- [ ] PWA audit passes basic checks
- [ ] App installable on mobile
- [ ] Cached pages accessible offline

## Files to Create/Modify
- [ ] `frontend/src/manifest.webmanifest`
- [ ] `frontend/ngsw-config.json`
- [ ] `frontend/src/index.html` (manifest link)
