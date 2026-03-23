# User Stories

Each story has: ID, title, description, acceptance criteria, test plan, and priority.
Priority: P0 = critical path, P1 = important, P2 = enhancement

---

## Epic: Authentication

### US-001: User Registration (P0)
**As a** new user, **I want to** register with username, email, and password **so that** I can access the prediction game.

**Acceptance Criteria**:
- Username: 3-50 characters, unique
- Email: valid format, unique
- Password: 8+ characters, must contain letter and digit
- Password confirmation must match
- On success: JWT access token (60min) and refresh token (7day) returned
- Password stored as BCrypt hash (cost 12)
- Duplicate email/username returns 400 with clear message

**Test Plan**:
- Unit: Validator rejects short username, invalid email, weak password
- Unit: Service creates user with hashed password
- Unit: Duplicate email returns error
- Integration: Full registration flow returns valid JWT

### US-002: User Login (P0)
**As a** registered user, **I want to** login with email and password **so that** I can access my account.

**Acceptance Criteria**:
- Email and password required
- Invalid credentials return 401
- Successful login returns JWT + refresh token
- Refresh token updated in database on each login

**Test Plan**:
- Unit: Invalid password returns null
- Unit: Valid credentials return AuthResponse with tokens
- Integration: Login → use token → access protected endpoint

### US-003: Token Refresh (P0)
**As a** logged-in user, **I want** my session to auto-refresh **so that** I don't get logged out unexpectedly.

**Acceptance Criteria**:
- POST /auth/refresh with valid refresh token returns new access token
- Expired refresh token (>7 days) returns 401
- Invalid token returns 401

**Test Plan**:
- Unit: Valid refresh token generates new access token
- Unit: Expired token returns null

### US-004: Logout (P0)
**As a** user, **I want to** logout **so that** my session is ended.

**Acceptance Criteria**:
- Clears access_token, refresh_token, user from localStorage
- Redirects to /login
- Protected routes become inaccessible

**Test Plan**:
- Unit: AuthService.logout() clears storage and sets isAuthenticated=false

---

## Epic: Match Management

### US-005: View Upcoming Matches (P0)
**As a** user, **I want to** see upcoming matches **so that** I can make predictions.

**Acceptance Criteria**:
- Shows matches with KickoffTime > now, not finished
- Displays: home team, away team, kickoff time, competition code
- Ordered by kickoff time ascending

**Test Plan**:
- Unit: Repository returns only future unfinished matches
- Unit: Component renders match cards correctly

### US-006: View Completed Matches (P0)
**As a** user, **I want to** see completed matches with results **so that** I can check scores.

**Acceptance Criteria**:
- Shows finished matches with final scores
- Ordered by kickoff time descending (most recent first)
- Shows my prediction and points earned if exists

**Test Plan**:
- Unit: Repository returns finished matches with scores
- Unit: Match card shows score and prediction points

### US-007: Filter Matches by Competition (P1)
**As a** user, **I want to** filter matches by competition **so that** I see only relevant matches.

**Acceptance Criteria**:
- Dropdown with available competitions
- Filters both upcoming and completed tabs
- Remembers last selected competition (localStorage)
- Filtered by user's preferred competitions (from preferences)

**Test Plan**:
- Unit: getFiltered with competitionCode returns correct matches
- Unit: Component updates on competition change

### US-008: Filter Matches by Matchday (P1)
**As a** user, **I want to** filter by matchday **so that** I see a specific round.

**Acceptance Criteria**:
- Dropdown with available matchdays for selected competition
- Auto-selects nearest matchday for active tab
- For "upcoming": nearest future matchday
- For "completed": most recent finished matchday

**Test Plan**:
- Unit: getNearestMatchday returns correct day for each tab type

### US-009: Sync Match Data (P1)
**As a** user, **I want to** manually refresh match data **so that** I see latest scores.

**Acceptance Criteria**:
- Sync button in header
- Calls POST /matches/sync
- Shows loading spinner during sync
- Reloads page after completion
- Auto-sync runs every 60 minutes in background

**Test Plan**:
- Unit: Sync endpoint calls SyncAllCompetitionsAsync
- Unit: Button disabled during sync

---

## Epic: Predictions

### US-010: Submit Prediction (P0)
**As a** user, **I want to** predict a match score **so that** I can earn points.

**Acceptance Criteria**:
- Navigate from match card to prediction form
- Input home score (0-10) and away score (0-10)
- Cannot submit after match kickoff time
- One prediction per user per match (409 if duplicate)
- Shows countdown to deadline
- Saves prediction with status "PENDING"

**Test Plan**:
- Unit: Rejects prediction after kickoff
- Unit: Rejects duplicate prediction (409)
- Unit: Valid prediction saved with PENDING status
- Unit: Countdown displays correctly

### US-011: Edit Prediction (P1)
**As a** user, **I want to** edit my prediction before kickoff **so that** I can change my mind.

**Acceptance Criteria**:
- Pre-fills existing scores in form
- Only allowed before kickoff
- Updates existing prediction (PUT)
- Shows "editing" mode indicator

**Test Plan**:
- Unit: PUT updates scores, keeps same prediction ID
- Unit: Rejects edit after kickoff

### US-012: View My Predictions (P1)
**As a** user, **I want to** see all my predictions **so that** I can track my history.

**Acceptance Criteria**:
- Lists all predictions with match info
- Shows points earned for scored predictions
- Ordered by creation date descending
- Shows prediction status (PENDING or SCORED)

**Test Plan**:
- Unit: Returns predictions with associated match data

---

## Epic: Scoring & Leaderboard

### US-013: Automatic Scoring (P0)
**As a** system, **I want to** automatically score predictions when match results arrive **so that** points are calculated without manual intervention.

**Acceptance Criteria**:
- When match status changes to FINISHED with scores:
  - All PENDING predictions for that match get scored
  - Points calculated per GAME-RULES.md (5/4/3/1/0)
  - Prediction status set to "SCORED"
  - CompetitionCode populated on prediction
- Scoring triggered by:
  1. Hourly sync job (UpdateMatchScoresAsync)
  2. Full sync (SyncAllCompetitionsAsync)
  3. Manual result entry (POST /matches/{id}/result)
  4. 30-min safety net job (ProcessFinishedMatchesAsync)

**Test Plan**:
- Unit: ScoringService returns correct points for all 12 test cases in GAME-RULES.md
- Unit: PENDING predictions become SCORED after processing
- Unit: Already SCORED predictions are not re-processed
- Integration: Full flow: create prediction → finish match → verify points

### US-014: View Leaderboard (P0)
**As a** user, **I want to** see the leaderboard **so that** I can compare my performance.

**Acceptance Criteria**:
- Shows ranked list of users by total points
- Per-competition leaderboard
- Displays: rank, username, total points, total predictions, accuracy %
- Current user highlighted
- Top 3 get medal icons
- Current user's stats card at top (rank, points, predictions, accuracy)

**Test Plan**:
- Unit: LeaderboardService groups by user, sums points, assigns ranks
- Unit: Tie-breaking: points DESC, then predictions DESC
- Unit: Component highlights current user

---

## Epic: Tournaments

### US-015: View Tournaments (P1)
**As a** user, **I want to** see available tournaments **so that** I can browse competitions.

**Acceptance Criteria**:
- Lists tournaments with name, season, type
- Links to view matches and leaderboard per tournament

**Test Plan**:
- Unit: Returns all tournaments ordered by name

---

## Epic: User Preferences

### US-016: Competition Preferences (P1)
**As a** user, **I want to** select which competitions I follow **so that** I only see relevant matches.

**Acceptance Criteria**:
- Checkboxes for all 12 competitions
- Selection persisted to localStorage
- Match list and leaderboard filtered by selected competitions
- Shows competition full names (PL → Premier League, etc.)

**Test Plan**:
- Unit: Selected competitions saved to localStorage
- Unit: Match list filters by selected competitions

---

## Epic: PWA & Offline

### US-017: PWA Installation (P2)
**As a** user, **I want to** install the app on my phone **so that** I can access it like a native app.

**Acceptance Criteria**:
- Service worker registered
- Web manifest with app name, icons, theme color
- Installable from browser
- Works offline for cached pages

### US-018: Offline Prediction Queue (P2)
**As a** user, **I want to** make predictions offline **so that** they sync when I reconnect.

**Acceptance Criteria**:
- Predictions queued in localStorage when offline
- Auto-synced when connection restored
- Offline indicator shown in UI

---

## Epic: UI/UX

### US-019: Dark/Light Theme (P2)
**As a** user, **I want to** toggle dark/light theme **so that** I can use the app comfortably.

**Acceptance Criteria**:
- Toggle button in header
- Theme persisted to localStorage
- All components respect theme

### US-020: Mobile Navigation (P1)
**As a** mobile user, **I want** bottom navigation **so that** I can easily switch between views.

**Acceptance Criteria**:
- Bottom nav with: Matches, Tournaments, Leaderboard, Predictions, Preferences
- Active tab highlighted
- Icons for each tab

### US-021: Points Info Tooltip (P2)
**As a** user, **I want to** see scoring rules in the prediction form **so that** I understand the point system.

**Acceptance Criteria**:
- Expandable info section showing all scoring tiers
- Shows in prediction form

---

## Epic: Data Integration

### US-022: Football Data Sync (P0)
**As a** system, **I want to** sync match data from football-data.org **so that** matches and scores are up to date.

**Acceptance Criteria**:
- Syncs 12 competitions from football-data.org v4 API
- Creates tournaments if not exist
- Creates/updates matches with scores and status
- Respects rate limit (6.5s between requests)
- Handles API key configuration
- Removes duplicate matches
- Auto-sync every 60 minutes

**Test Plan**:
- Unit: Match mapping from API response to entity
- Unit: Duplicate detection by (CompetitionCode, HomeTeam, AwayTeam, Matchday)
- Integration: Full sync creates tournaments and matches

---

## Epic: Deployment

### US-023: Backend Deployment (P0)
**As a** developer, **I want** the backend deployed to Render **so that** it's accessible online.

**Acceptance Criteria**:
- Dockerfile builds and runs correctly
- PostgreSQL URL parsing handles Render format
- CORS allows Vercel frontend
- Health endpoint returns 200
- Environment variables configured (JWT secret, DB URL, API key)

### US-024: Frontend Deployment (P0)
**As a** developer, **I want** the frontend deployed to Vercel **so that** users can access it.

**Acceptance Criteria**:
- Build output in correct directory
- SPA routing via vercel.json rewrites
- Production environment points to Render API URL
- PWA manifest and service worker accessible
