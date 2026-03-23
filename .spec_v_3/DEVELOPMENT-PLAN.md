# Development Plan - Football Prediction PWA v3

**Created**: 2026-03-23
**Total Tickets**: 33
**Estimated Duration**: 6 phases, sequential with internal parallelization

---

## Phase 1: Foundation (P0) — Tickets 001-007

```
TICKET-001: Solution & Project Setup (Clean Architecture)
Priority: P0
Assigned to: Backend Developer
Depends on: none
Complexity: M
User Story: N/A (infrastructure)
Critical path: YES
Create solution with 4 projects (Domain, Application, Infrastructure, Api), install all NuGet
packages at locked versions (TECH-STACK.md), configure global.json for .NET 9, add
Program.cs skeleton with JSON cycle handling (ERROR #15).

TICKET-002: Docker & PostgreSQL Setup
Priority: P0
Assigned to: DevOps Engineer
Depends on: TICKET-001
Complexity: S
User Story: N/A (infrastructure)
Critical path: YES
Create docker-compose.yml with PostgreSQL 16 on port 5433 (ERROR #5). Verify Docker
Desktop running (ERROR #6). Add health check for DB container.

TICKET-003: Domain Entities
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-001
Complexity: M
User Story: N/A (infrastructure)
Critical path: YES
Create all 5 entities (User, Tournament, GameWeek, Match, Prediction) in Domain project
with exact properties from PROJECT-SPEC.md. Navigation properties must be nullable (ERROR #18).

TICKET-004: DbContext, Entity Configs & Migration
Priority: P0
Assigned to: DB Specialist
Depends on: TICKET-002, TICKET-003
Complexity: L
User Story: N/A (infrastructure)
Critical path: YES
Create AppDbContext with auto-timestamping in SaveChangesAsync(). Configure all entity
relationships, unique constraints ((UserId,MatchId), (Code,Season), (TournamentId,WeekNumber)),
indexes (KickoffTime, Status). Generate initial migration via SQL script (ERROR #3).
EF packages must all be 9.0.x (ERROR #4).

TICKET-005: Repository Interfaces & Implementations
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-004
Complexity: M
User Story: N/A (infrastructure)
Critical path: YES
Create IRepository<T> generic interface + implementations for each aggregate root
(User, Tournament, Match, Prediction, GameWeek) in Application (interfaces) and
Infrastructure (implementations). Register in DI container.

TICKET-006: JWT Authentication Service
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-005
Complexity: L
User Story: US-001, US-002, US-003
Critical path: YES
Implement AuthService (Register, Login, RefreshToken), JwtTokenService (HS256, 60min
access, 7day refresh), BCrypt hashing (cost 12), AuthController with 3 endpoints,
JWT middleware configuration, FluentValidation for RegisterRequest/LoginRequest.

TICKET-007: Scoring Service + Unit Tests
Priority: P0
Assigned to: Backend Developer + QA Engineer
Depends on: TICKET-001
Complexity: M
User Story: US-013
Critical path: YES
Implement ScoringService.CalculatePoints() per GAME-RULES.md reference implementation.
Write all 12 test cases from GAME-RULES.md. This is a pure logic service with zero
dependencies — can be built in parallel with DB work.
```

**Phase 1 Parallelization**:
- TICKET-002 and TICKET-003 run in parallel (both depend only on 001)
- TICKET-007 runs in parallel with TICKET-002/003/004 (no DB dependency)

---

## Phase 2: Core Backend (P0) — Tickets 008-013

```
TICKET-008: Tournament CRUD
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-005
Complexity: S
User Story: US-015
Critical path: no
TournamentService + TournamentController with full CRUD (GET all, GET by id, POST,
PUT, DELETE). Return DTOs, not entities.

TICKET-009: Match CRUD + Filtering Endpoints
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-005
Complexity: L
User Story: US-005, US-006, US-007, US-008
Critical path: YES
MatchService + MatchController: GET all, GET by id, GET /upcoming, GET /finished,
GET /filtered(?competitionCode&matchday), GET /competitions, GET /matchdays,
GET /nearest-matchday, POST, PUT, DELETE, POST /{id}/result, POST /cleanup-duplicates.
MatchResultService for manual result entry that triggers scoring.

TICKET-010: Prediction CRUD + Validation
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-006, TICKET-009
Complexity: L
User Story: US-010, US-011, US-012
Critical path: YES
PredictionService + PredictionController: GET by id, GET /my, GET /match/{matchId},
POST (validate: before kickoff, no duplicate → 409), PUT (before kickoff only),
DELETE (before kickoff only). Requires JWT auth on all endpoints.
Unique constraint (UserId, MatchId) enforced at DB level.

TICKET-011: Leaderboard Service
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-010
Complexity: M
User Story: US-014
Critical path: YES
LeaderboardService: GetOverallLeaderboard(tournamentId), GetByCompetition(code).
Computed on-demand: group predictions by user, sum points, count predictions,
calculate average. Rank DESC by points, tiebreak by prediction count, then average.
LeaderboardController with 2 GET endpoints.

TICKET-012: Football-Data.org Sync Service
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-008, TICKET-009
Complexity: L
User Story: US-022
Critical path: YES
FootballDataService: SyncAll (12 competitions), SyncMatches (per competition),
UpdateScores, CleanupDuplicates. Rate limit 6.5s between requests (ERROR #17).
Idempotent upsert by (CompetitionCode, HomeTeam, AwayTeam, Matchday).
Creates tournaments if not exist. POST /matches/sync endpoint.

TICKET-013: Background Jobs (Sync + Scoring)
Priority: P0
Assigned to: Backend Developer
Depends on: TICKET-007, TICKET-012
Complexity: M
User Story: US-013, US-022
Critical path: YES
FootballDataSyncJob (IHostedService, 60min interval): calls SyncAll, then
ScorePendingPredictions (ERROR #16). ResultProcessingBackgroundJob (30min):
safety net that scores any missed predictions. Both jobs must call scoring
after sync.
```

**Phase 2 Parallelization**:
- TICKET-008 and TICKET-009 run in parallel (both depend only on 005)
- TICKET-007 (from Phase 1) feeds into TICKET-013

---

## Phase 3: Core Frontend (P0) — Tickets 014-018

```
TICKET-014: Frontend Foundation (Angular 19 Setup)
Priority: P0
Assigned to: Frontend Developer
Depends on: TICKET-006 (backend auth must exist)
Complexity: L
User Story: N/A (infrastructure)
Critical path: YES
Create Angular 19 project with standalone components. Install Tailwind 3.4.17 (ERROR #8).
Configure routing with lazy loading, auth guard, JWT interceptor (attaches Bearer token,
handles 401 → refresh → retry → logout). ApiService base wrapper. StorageService.
Environment files with fileReplacements (ERROR #10). Catch-all route (ERROR #11).
Output path verified for dist/frontend/browser (ERROR #9).

TICKET-015: Auth UI (Login + Register)
Priority: P0
Assigned to: Frontend Developer
Depends on: TICKET-014
Complexity: M
User Story: US-001, US-002, US-004
Critical path: YES
Login page: email + password, validation, error display, navigate to /matches on success.
Register page: username (3-50), email, password (8+, letter+digit), confirm password with
mismatch validator. AuthService with signals (isAuthenticated, currentUser). Logout clears
storage, redirects to /login.

TICKET-016: Match List UI (Tabs, Filters, Cards)
Priority: P0
Assigned to: Frontend Developer
Depends on: TICKET-015, TICKET-009
Complexity: L
User Story: US-005, US-006, US-007, US-008
Critical path: YES
Three tabs: Upcoming | Live | Completed (with counts). Competition selector dropdown.
Matchday filter dropdown. Auto-select nearest matchday per tab. Match cards: teams,
time/score, status badge, existing prediction display, predict button → navigate to
prediction form. MatchService with all API calls.

TICKET-017: Prediction Form UI
Priority: P0
Assigned to: Frontend Developer
Depends on: TICKET-016, TICKET-010
Complexity: M
User Story: US-010, US-011
Critical path: YES
Prediction form page (/predictions/new?matchId=). Shows match info (teams, kickoff).
Score inputs (0-10) for home/away. Countdown timer to deadline (updates every 30s).
Edit mode: pre-fills existing scores. Prevents submission after kickoff (client-side
check). PredictionService for create/update. Navigate back to /matches on success.

TICKET-018: Leaderboard UI
Priority: P0
Assigned to: Frontend Developer
Depends on: TICKET-014, TICKET-011
Complexity: M
User Story: US-014
Critical path: no
Competition selector dropdown. Current user stats card (rank, points, predictions,
accuracy %). Ranked table with medals for top 3. Highlights current user row.
LeaderboardService with API calls.
```

**Phase 3 Parallelization**:
- TICKET-018 can run in parallel with TICKET-016/017 (only needs 014 + backend 011)
- Frontend work starts as soon as backend auth (006) is done

---

## Phase 4: Enhancement (P1) — Tickets 019-024

```
TICKET-019: My Predictions View
Priority: P1
Assigned to: Frontend Developer
Depends on: TICKET-017
Complexity: S
User Story: US-012
Critical path: no
My Predictions page (/predictions). Lists user's predictions with match info and
points earned. Status display (PENDING/SCORED). Ordered by creation date descending.

TICKET-020: Tournaments View
Priority: P1
Assigned to: Frontend Developer
Depends on: TICKET-014, TICKET-008
Complexity: S
User Story: US-015
Critical path: no
Tournaments page (/tournaments). Tournament cards with name, season, type.
View Matches and Leaderboard action buttons. TournamentService with API calls.

TICKET-021: Preferences View (Competition Selection)
Priority: P1
Assigned to: Frontend Developer
Depends on: TICKET-014
Complexity: S
User Story: US-016
Critical path: no
Preferences page (/preferences). User info display. Competition checkboxes (all 12).
Persists selection to localStorage. Match list and leaderboard filter by selected
competitions.

TICKET-022: Header Component
Priority: P1
Assigned to: Frontend Developer
Depends on: TICKET-015
Complexity: S
User Story: US-009, US-020
Critical path: no
Header for logged-in pages: app title (links to /matches), sync button placeholder,
theme toggle placeholder, settings link, logout button.

TICKET-023: Bottom Navigation (Mobile)
Priority: P1
Assigned to: Frontend Developer
Depends on: TICKET-014
Complexity: S
User Story: US-020
Critical path: no
Bottom nav bar: Matches, Tournaments, Leaderboard, Predictions, Preferences.
Icons for each tab. Active tab highlighted. Mobile responsive.

TICKET-024: Sync Button Integration
Priority: P1
Assigned to: Frontend Developer + Backend Developer
Depends on: TICKET-012, TICKET-022
Complexity: S
User Story: US-009
Critical path: no
Wire up header sync button to POST /matches/sync. Show loading spinner during sync.
Reload match data after completion. Disable button during sync.
```

**Phase 4 Parallelization**:
- TICKET-019, 020, 021, 022, 023 can ALL run in parallel (independent features)
- TICKET-024 depends on 012 + 022

---

## Phase 5: PWA & Polish (P2) — Tickets 025-028

```
TICKET-025: PWA Setup (Manifest + Service Worker)
Priority: P2
Assigned to: Frontend Developer + DevOps Engineer
Depends on: TICKET-014
Complexity: M
User Story: US-017
Critical path: no
Add @angular/pwa. Configure web manifest (app name, icons, theme color).
Service worker registration. Cache strategy for static assets.

TICKET-026: Offline Support
Priority: P2
Assigned to: Frontend Developer
Depends on: TICKET-025, TICKET-017
Complexity: M
User Story: US-018
Critical path: no
OfflineService with isOnline signal. OfflineQueueService: queue predictions in
localStorage when offline, auto-sync on reconnect. Offline indicator in UI.

TICKET-027: Dark/Light Theme Toggle
Priority: P2
Assigned to: Frontend Developer
Depends on: TICKET-022
Complexity: S
User Story: US-019
Critical path: no
Theme toggle in header. Persist to localStorage. Apply Tailwind dark mode class
to document. All components must respect dark/light theme.

TICKET-028: Points Info Tooltip
Priority: P2
Assigned to: Frontend Developer
Depends on: TICKET-017
Complexity: S
User Story: US-021
Critical path: no
Expandable info section in prediction form showing all 5 scoring tiers from
GAME-RULES.md. Collapsible by default.
```

**Phase 5 Parallelization**:
- TICKET-027 and TICKET-028 can run in parallel
- TICKET-025 is prerequisite for TICKET-026

---

## Phase 6: Deployment (P0) — Tickets 029-033

```
TICKET-029: Backend Deployment (Render)
Priority: P0
Assigned to: DevOps Engineer
Depends on: TICKET-013
Complexity: M
User Story: US-023
Critical path: YES
Create Dockerfile with multi-stage build (ERROR #14: copy ALL .csproj before restore).
PostgreSQL URL parser for Render format (ERROR #7: handle postgres:// scheme, missing
port). Health endpoint. Configure Render service with environment variables (JWT_SECRET,
DATABASE_URL, FOOTBALL_DATA_API_KEY).

TICKET-030: Frontend Deployment (Vercel)
Priority: P0
Assigned to: DevOps Engineer
Depends on: TICKET-014
Complexity: S
User Story: US-024
Critical path: YES
Create vercel.json with SPA rewrite rule (ERROR #12). Set output directory to
dist/frontend/browser (ERROR #9). Configure production environment.prod.ts with
Render API URL. Verify build and deploy.

TICKET-031: Production Configuration
Priority: P0
Assigned to: DevOps Engineer + Backend Developer
Depends on: TICKET-029, TICKET-030
Complexity: S
User Story: US-023, US-024
Critical path: YES
Set all production environment variables. Verify DB connection, JWT signing,
football-data.org API key. Run initial data sync. Verify background jobs start.

TICKET-032: CORS & Environment Setup
Priority: P0
Assigned to: DevOps Engineer
Depends on: TICKET-031
Complexity: S
User Story: US-023
Critical path: YES
Configure CORS with flexible origin matching (ERROR #13): localhost:4200, production
Vercel URL, *.vercel.app pattern via SetIsOriginAllowed. Test preflight requests.

TICKET-033: End-to-End Verification
Priority: P0
Assigned to: QA Engineer
Depends on: TICKET-032
Complexity: M
User Story: all
Critical path: YES
Full E2E test: register → login → view matches → make prediction → wait for scoring
→ check leaderboard. Verify sync job runs. Verify PWA installable. Verify all error
prevention items from ERROR-PREVENTION.md are addressed.
```

**Phase 6 Parallelization**:
- TICKET-029 and TICKET-030 run in parallel
- TICKET-031 onwards is sequential

---

## Critical Path

The minimum-duration sequence (every delay here delays the project):

```
001 → 003 → 004 → 005 → 006 → 009 → 010 → 011 → 016 → 017 → 029 → 031 → 032 → 033
 M      M     L     M     L     L     L     M     L      M     M      S     S     M
```

**14 tickets on critical path** spanning all 6 phases.

Secondary critical chain (backend sync path):
```
001 → 003 → 004 → 005 → 008+009 → 012 → 013 → 029
```

---

## Parallelization Opportunities

| Window | Parallel Tickets | Notes |
|--------|-----------------|-------|
| Phase 1 | 002 + 003 + 007 | Docker, entities, scoring all independent after 001 |
| Phase 2 | 008 + 009 | Tournament and Match CRUD both need only 005 |
| Phase 3 | 016+017 // 018 | Leaderboard UI independent of match/prediction UI |
| Phase 4 | 019+020+021+022+023 | All 5 enhancement features are independent |
| Phase 5 | 027 + 028 | Theme and tooltip are independent |
| Phase 6 | 029 + 030 | Backend and frontend deploy in parallel |

**Maximum parallelism**: Phase 4 with 5 simultaneous tickets.

---

## Risk Areas

| Ticket | Risk | Error Ref | Mitigation |
|--------|------|-----------|------------|
| TICKET-004 | Migration not applying, package version mix | ERROR #3, #4 | Use SQL script method, verify all EF packages 9.0.x |
| TICKET-006 | JWT config mistakes, BCrypt cost factor | ERROR #1, #2 | Verify .NET SDK version, test token generation first |
| TICKET-012 | Rate limiting, duplicate matches, API key issues | ERROR #17 | 6.5s delay, idempotent upsert, test with single competition first |
| TICKET-013 | Scoring gap after sync | ERROR #16 | Call ScorePendingPredictions in BOTH sync paths |
| TICKET-014 | Tailwind v4 install, wrong output dir, missing catch-all | ERROR #8, #9, #11 | Pin Tailwind 3.4.17, verify angular.json outputPath |
| TICKET-029 | Dockerfile restore fails, DB URL parsing | ERROR #7, #14 | Copy all .csproj first, handle both postgres:// schemes |
| TICKET-030 | SPA routing 404s, wrong build output | ERROR #9, #12 | vercel.json rewrite, verify dist/frontend/browser |
| TICKET-032 | CORS blocks preview deployments | ERROR #13 | Use SetIsOriginAllowed with flexible matching |

**Highest risk tickets**: TICKET-004 (DB), TICKET-012 (external API), TICKET-029 (deployment). Each has multiple error prevention items and historically cost the most debug time.

---

## Summary

| Phase | Tickets | Priority | Complexity |
|-------|---------|----------|------------|
| 1: Foundation | 001-007 | P0 | 2S, 3M, 2L |
| 2: Core Backend | 008-013 | P0 | 1S, 2M, 3L |
| 3: Core Frontend | 014-018 | P0 | 0S, 3M, 2L |
| 4: Enhancement | 019-024 | P1 | 5S, 0M, 0L (+ 1 dual) |
| 5: PWA & Polish | 025-028 | P2 | 2S, 2M, 0L |
| 6: Deployment | 029-033 | P0 | 2S, 2M, 0L (+ 1 dual) |
| **Total** | **33** | | **12S, 12M, 7L** |
