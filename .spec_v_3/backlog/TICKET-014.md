# TICKET-014: Frontend Foundation (Angular 19 Setup)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Frontend Developer
**Depends on**: TICKET-006
**User Story**: N/A (infrastructure)
**Complexity**: L
**Critical path**: YES

## Description
Create Angular 19 project with standalone components, Tailwind 3.4.17, routing with lazy loading, auth guard, JWT interceptor, ApiService, StorageService, environment files.

## Acceptance Criteria
- [ ] Angular 19 project created at frontend/
- [ ] Standalone components (no NgModules)
- [ ] Tailwind CSS 3.4.17 installed and configured (NOT v4 — ERROR #8)
- [ ] PostCSS + Autoprefixer configured
- [ ] App routing with lazy loading for feature routes
- [ ] Auth guard: redirects to /login if not authenticated
- [ ] JWT interceptor: attaches Bearer token, handles 401 → refresh → retry → logout
- [ ] ApiService: base HTTP wrapper (get, post, put, delete)
- [ ] AuthService: signals (isAuthenticated, currentUser), getAccessToken
- [ ] StorageService: localStorage wrapper (setItem, getItem, removeItem, setObject, getObject)
- [ ] Environment files with fileReplacements for production — ERROR #10
- [ ] Catch-all route `{ path: '**', redirectTo: '' }` — ERROR #11
- [ ] Output path: dist/frontend/browser — ERROR #9
- [ ] `ng build` succeeds with 0 errors
- [ ] TypeScript strict mode enabled

## Test Plan
- [ ] `ng build` succeeds
- [ ] `ng serve` starts without errors
- [ ] Auth guard redirects unauthenticated users
- [ ] Interceptor attaches Bearer token to API calls

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #8, #9, #10, #11
- Install Tailwind exactly: `npm install tailwindcss@3.4.17 postcss autoprefixer`
- Feature folders: auth/, matches/, predictions/, leaderboard/, preferences/
- angular.json outputPath must produce dist/frontend/browser

## Files to Create/Modify
- [ ] `frontend/` (entire Angular project scaffolding)
- [ ] `frontend/src/app/app.routes.ts`
- [ ] `frontend/src/app/core/services/api.service.ts`
- [ ] `frontend/src/app/core/services/auth.service.ts`
- [ ] `frontend/src/app/core/services/storage.service.ts`
- [ ] `frontend/src/app/core/guards/auth.guard.ts`
- [ ] `frontend/src/app/core/interceptors/jwt.interceptor.ts`
- [ ] `frontend/src/environments/environment.ts`
- [ ] `frontend/src/environments/environment.prod.ts`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/postcss.config.js`
