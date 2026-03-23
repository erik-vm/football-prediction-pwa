# TICKET-029: Backend Deployment (Render)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: DevOps Engineer
**Depends on**: TICKET-013
**User Story**: US-023
**Complexity**: M
**Critical path**: YES

## Description
Create Dockerfile with multi-stage build, PostgreSQL URL parser for Render format, health endpoint, Render service configuration.

## Acceptance Criteria
- [ ] Dockerfile with multi-stage build (build + runtime)
- [ ] Copy ALL .csproj files before restore — ERROR #14
- [ ] Restore only API project
- [ ] PostgreSQL URL parser handles postgres:// and postgresql:// schemes — ERROR #7
- [ ] Default port to 5432 when missing from URL
- [ ] SSL Mode=Require, Trust Server Certificate=true for Render
- [ ] GET /health returns 200
- [ ] Environment variables: DATABASE_URL, JWT__SecretKey, FootballData__ApiKey
- [ ] Docker build succeeds locally
- [ ] Render web service configuration documented

## Test Plan
- [ ] Docker build completes without errors
- [ ] Container starts and health endpoint responds
- [ ] PostgreSQL URL parsing works for Render format
- [ ] PostgreSQL URL parsing works for standard format

## Technical Notes
- HIGH RISK: ERROR #7 (URL format) and ERROR #14 (Dockerfile restore) are most common deployment issues
- Test URL parsing with: postgres://user:pass@host/dbname (no port)
- Test URL parsing with: postgres://user:pass@host:5432/dbname (with port)

## Files to Create/Modify
- [ ] `backend/Dockerfile`
- [ ] `backend/src/FootballPrediction.Api/Program.cs` (URL parser)
- [ ] `.dockerignore`
