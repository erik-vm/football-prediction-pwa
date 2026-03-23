# Development Workflow

## Phase 1: Project Bootstrap

### Step 1: Orchestrator reads START-HERE.md
### Step 2: Orchestrator spawns Analyst + Architect + Researcher

### Step 3: Planning Session
1. **Analyst** reviews USER-STORIES.md, validates acceptance criteria
2. **Architect** reviews ARCHITECTURE.md and PROJECT-SPEC.md
3. **Researcher** investigates any unknowns (API docs, framework features)
4. Together they create the **Development Plan**:
   - Ordered list of tickets with dependencies
   - Each ticket assigned to an agent type
   - Critical path identified

### Step 4: Orchestrator creates tickets in backlog/

## Phase 2: Foundation (P0 tickets)

### Infrastructure Setup
1. **DB Specialist** creates entity configurations and initial migration
2. **Backend Developer** sets up project structure (Clean Architecture)
3. **DevOps Engineer** creates docker-compose.yml and Dockerfile
4. **Lead Developer** pushes foundation code

### Order of Foundation Tickets
```
1. Project setup (solution, projects, packages)          → Backend Dev
2. Database schema + migration                           → DB Specialist
3. Docker setup (PostgreSQL)                             → DevOps
4. Entity configurations (DbContext, OnModelCreating)    → DB Specialist
5. Repository interfaces + implementations               → Backend Dev
6. JWT authentication (service, controller, middleware)   → Backend Dev
7. Core scoring service (GAME-RULES.md implementation)   → Backend Dev + QA
```

## Phase 3: Core Features (P0 tickets)

### Backend first, then Frontend
```
8.  Tournament CRUD                                      → Backend Dev
9.  Match CRUD + filtering                               → Backend Dev
10. Prediction CRUD + validation                         → Backend Dev
11. Leaderboard service                                  → Backend Dev
12. Football-data.org sync service                       → Backend Dev + Researcher
13. Background jobs (sync + scoring)                     → Backend Dev
14. Frontend foundation (routing, guards, interceptors)  → Frontend Dev
15. Auth UI (login, register)                           → Frontend Dev + UI Designer
16. Match list UI (tabs, filters, cards)                → Frontend Dev + UI Designer
17. Prediction form UI                                   → Frontend Dev + UI Designer
18. Leaderboard UI                                       → Frontend Dev + UI Designer
```

## Phase 4: Enhancement Features (P1 tickets)

```
19. My Predictions view                                  → Frontend Dev
20. Tournament list view                                 → Frontend Dev
21. Preferences (competition selection)                  → Frontend Dev
22. Header (sync button, theme, navigation)             → Frontend Dev
23. Bottom navigation (mobile)                           → Frontend Dev
24. Match data sync button                               → Frontend Dev + Backend Dev
```

## Phase 5: PWA & Polish (P2 tickets)

```
25. PWA setup (manifest, service worker)                → Frontend Dev + DevOps
26. Offline support (queue, indicator)                   → Frontend Dev
27. Dark/light theme                                     → Frontend Dev
28. Points info tooltip                                  → Frontend Dev
```

## Phase 6: Deployment (P0)

```
29. Backend deployment (Render)                          → DevOps
30. Frontend deployment (Vercel)                         → DevOps
31. Production configuration                             → DevOps + Backend Dev
32. CORS + environment setup                             → DevOps
33. End-to-end verification                              → QA
```

## Test-First Development Flow

For each feature ticket:
```
1.  QA reads acceptance criteria
2.  QA writes failing tests
3.  Developer receives ticket + failing tests
4.  Developer implements code until tests pass
5.  Developer runs full test suite (must all pass)
6.  Developer requests Code Review
7.  Code Reviewer reviews quality/design (APPROVED / CHANGES_REQUESTED)
8.  Security Engineer reviews (MANDATORY for auth, CORS, secrets, new endpoints)
9.  QA does final verification
10. Lead Developer pushes to git
11. Orchestrator marks ticket DONE
```

**Security review is mandatory** for tickets touching: auth, CORS, new API endpoints, environment config, user data handling. For other tickets, Security Engineer review is optional but Code Reviewer must still check basic security items.

## Quality Gates (Non-Negotiable)

Before ANY ticket can be marked DONE:
- [ ] All acceptance criteria met
- [ ] All tests pass (existing + new)
- [ ] Build succeeds with 0 errors, 0 warnings
- [ ] Code reviewed and approved
- [ ] QA verified
- [ ] Committed with proper message format

## Error Prevention

Before EVERY phase, check ERROR-PREVENTION.md for relevant warnings:
- Phase 2 (Foundation): Errors 1-5 (tooling, infrastructure)
- Phase 3 (Backend): Errors 15-18 (serialization, scoring, idempotency)
- Phase 3 (Frontend): Errors 8-11 (Tailwind, Angular)
- Phase 6 (Deployment): Errors 7, 12-14 (URLs, CORS, Dockerfile)
