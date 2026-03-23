# TICKET-030: Frontend Deployment (Vercel)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: DevOps Engineer
**Depends on**: TICKET-014
**User Story**: US-024
**Complexity**: S
**Critical path**: YES

## Description
Create vercel.json with SPA rewrite rule, configure production environment, verify build output directory.

## Acceptance Criteria
- [ ] vercel.json with SPA rewrite rule — ERROR #12
- [ ] Rewrite: `/((?!assets|.*\\.).*) → /index.html`
- [ ] Build output directory: dist/frontend/browser — ERROR #9
- [ ] environment.prod.ts points to Render API URL
- [ ] fileReplacements configured in angular.json — ERROR #10
- [ ] Node.js 20+ specified for Vercel
- [ ] `ng build --configuration production` succeeds
- [ ] Built files in correct output directory

## Test Plan
- [ ] Production build succeeds
- [ ] Output in dist/frontend/browser
- [ ] vercel.json syntax valid
- [ ] Environment file replacement works

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #9, #10, #12
- Vercel output directory setting: dist/frontend/browser

## Files to Create/Modify
- [ ] `frontend/vercel.json`
- [ ] `frontend/src/environments/environment.prod.ts` (update API URL)
- [ ] `frontend/angular.json` (verify outputPath and fileReplacements)
