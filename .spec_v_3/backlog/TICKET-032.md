# TICKET-032: CORS & Environment Setup

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: DevOps Engineer
**Depends on**: TICKET-031
**User Story**: US-023
**Complexity**: S
**Critical path**: YES

## Description
Configure CORS with flexible origin matching for localhost, production Vercel URL, and preview deployments.

## Acceptance Criteria
- [ ] CORS allows http://localhost:4200 (development)
- [ ] CORS allows production Vercel URL (exact match)
- [ ] CORS allows *.vercel.app pattern for preview deployments — ERROR #13
- [ ] Uses SetIsOriginAllowed with flexible matching
- [ ] AllowAnyMethod, AllowAnyHeader, AllowCredentials configured
- [ ] Preflight requests work correctly
- [ ] No CORS errors in browser console

## Test Plan
- [ ] API accessible from localhost:4200
- [ ] API accessible from production Vercel URL
- [ ] API accessible from Vercel preview URL
- [ ] Preflight OPTIONS requests return correct headers

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #13
- Use: `.SetIsOriginAllowed(origin => origin.Contains("vercel.app") || origin.Contains("localhost"))`

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Api/Program.cs` (CORS configuration)
