# TICKET-002: Docker & PostgreSQL Setup

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: DevOps Engineer
**Depends on**: TICKET-001
**User Story**: N/A (infrastructure)
**Complexity**: S
**Critical path**: YES

## Description
Create docker-compose.yml with PostgreSQL 16 on port 5433. Verify Docker Desktop prerequisite.

## Acceptance Criteria
- [ ] docker-compose.yml exists at backend/docker-compose.yml
- [ ] PostgreSQL 16 image configured
- [ ] Port mapped to 5433:5432 (avoids conflict - ERROR #5)
- [ ] Database name, user, password configured via environment
- [ ] Volume for data persistence
- [ ] `docker-compose up -d` starts PostgreSQL successfully
- [ ] Connection string works from .NET application

## Test Plan
- [ ] `docker-compose up -d` starts without errors
- [ ] `netstat -ano | findstr :5433` shows PostgreSQL listening
- [ ] Can connect to DB via psql or similar tool

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #5 (port conflict), ERROR #6 (Docker Desktop)
- Use port 5433 to avoid conflict with any local PostgreSQL on 5432

## Files to Create/Modify
- [ ] `backend/docker-compose.yml`
