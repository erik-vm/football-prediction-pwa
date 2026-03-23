# TICKET-031: Production Configuration

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: DevOps Engineer + Backend Developer
**Depends on**: TICKET-029, TICKET-030
**User Story**: US-023, US-024
**Complexity**: S
**Critical path**: YES

## Description
Set all production environment variables, verify DB connection, JWT signing, API key. Run initial data sync.

## Acceptance Criteria
- [ ] Render environment variables set: DATABASE_URL, JWT__SecretKey (32+ chars), JWT__Issuer, JWT__Audience, FootballData__ApiKey
- [ ] Vercel environment configured
- [ ] DB connection verified (migration applied)
- [ ] JWT token generation works in production
- [ ] Football-data.org API key works
- [ ] Initial sync completed successfully
- [ ] Background jobs start and run on schedule

## Test Plan
- [ ] Health endpoint returns 200 in production
- [ ] Can register and login via production API
- [ ] Sync endpoint returns success
- [ ] Matches appear in database after sync

## Files to Create/Modify
- [ ] Environment variable documentation
- [ ] Verify all existing configs work in production
