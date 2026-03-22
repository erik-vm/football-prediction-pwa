# V1 Feature Inventory (version_1_06_02_2026)

**Date**: 2026-03-22
**Purpose**: Complete feature reference for rebuilding

---

## BACKEND API ENDPOINTS

### AuthController (`/api/auth`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | /register | None | Register (username, email, password) |
| POST | /login | None | Login, returns JWT tokens |
| POST | /refresh | None | Refresh access token |

### MatchesController (`/api/matches`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | / | Public | Filtered matches (competitionCode, isFinished, matchday) |
| GET | /gameweek/{gameWeekId} | Public | Matches by game week |
| GET | /{id} | Public | Single match |
| GET | /upcoming | Public | Upcoming matches |
| GET | /finished | Public | Finished matches |
| POST | / | Admin | Create match |
| PUT | /{id} | Admin | Update match |
| DELETE | /{id} | Admin | Delete match |
| POST | /{id}/result | Admin | Enter result (triggers scoring) |

### PredictionsController (`/api/predictions`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | / | Required | Create prediction (before kickoff) |
| GET | /{id} | Required | Get prediction by ID |
| GET | /my | Required | User's predictions |
| GET | /match/{matchId} | Required | Prediction for match |
| PUT | /{id} | Required | Update prediction |
| DELETE | /{id} | Required | Delete prediction |

### LeaderboardController (`/api/leaderboard`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | /overall/{tournamentId} | Public | Overall leaderboard |
| GET | /weekly/{gameWeekId} | Public | Weekly leaderboard |
| GET | /competition/{code} | Public | Competition leaderboard |
| GET | /competition/{code}/user/{userId} | Public | User rank in competition |
| POST | /weekly/{gameWeekId}/calculate-bonuses | Admin | Calculate weekly bonuses |

### TournamentsController (`/api/tournaments`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | / | Public | All tournaments |
| GET | /active | Public | Active tournament |
| GET | /{id} | Public | Tournament by ID |
| POST | / | Admin | Create |
| PUT | /{id} | Admin | Update |
| DELETE | /{id} | Admin | Delete |

### GameWeeksController (`/api/gameweeks`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | /tournament/{tournamentId} | Public | Game weeks for tournament |
| GET | /{id} | Public | Game week by ID |
| POST | / | Admin | Create |
| PUT | /{id} | Admin | Update |
| DELETE | /{id} | Admin | Delete |

### CompetitionsController (`/api/competitions`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | / | Public | All competitions (optional activeOnly) |
| GET | /{code} | Public | Competition by code |

### UserPreferencesController (`/api/users`)
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | /me/preferences | Required | User's competition preferences |
| POST | /me/preferences/competitions/{code} | Required | Add preference |
| DELETE | /me/preferences/competitions/{code} | Required | Remove preference |

---

## DATABASE ENTITIES

### Core Entities
- **User**: Id, Username, Email, PasswordHash, Role, CreatedAt, LastLoginAt, RefreshToken, RefreshTokenExpiry
- **Tournament**: Id, Name, Season, StartDate, EndDate, IsActive
- **GameWeek**: Id, TournamentId, WeekNumber, StartDate, EndDate
- **Match**: Id, GameWeekId, ExternalMatchId, HomeTeam, AwayTeam, KickoffTime, Stage, HomeScore, AwayScore, IsFinished, CompetitionCode, Venue, Matchday, StageMultiplier
- **Prediction**: Id, UserId, MatchId, HomeScore, AwayScore, PointsEarned, Status, CompetitionCode, CreatedAt, UpdatedAt
- **Competition**: Code (PK), Name, Emblem, IsActive, CreatedAt
- **UserCompetitionPreference**: Id, UserId, CompetitionCode, CreatedAt
- **UserCompetitionStats**: Id, UserId, CompetitionCode, TotalPoints, TotalPredictions, Accuracy, Rank, UpdatedAt

---

## FRONTEND ROUTING

```
/ → HomeComponent
/login → LoginComponent
/register → RegisterComponent
/predictions (authGuard)
  / → PredictionsListComponent
  /:matchId → PredictionFormComponent
/leaderboard
  / → OverallLeaderboardComponent
  /weekly → WeeklyLeaderboardComponent
  /stats → UserStatsComponent
/preferences (authGuard) → CompetitionPreferencesComponent
/admin (adminGuard)
  / → AdminDashboardComponent
  /tournaments → TournamentListComponent
  /tournaments/new → TournamentFormComponent
  /tournaments/:id/edit → TournamentFormComponent
  /matches → MatchListComponent
  /matches/new → MatchFormComponent
  /matches/:id/edit → MatchFormComponent
  /results → ResultEntryComponent
** → Redirect to /
```

---

## FRONTEND SERVICES

| Service | Purpose |
|---------|---------|
| AuthService | JWT management, signals (currentUser, isAuthenticated, isAdmin) |
| MatchService | Match fetching with offline fallback (IndexedDB) |
| PredictionService | CRUD with offline queue (SyncQueueService) |
| LeaderboardService | Overall, weekly, competition leaderboards |
| CompetitionService | List competitions |
| CompetitionPreferenceService | User preferences (add/remove/get/toggle) |
| IndexedDBService | Dexie-based offline storage |
| SignalRService | Real-time updates (WebSocket/LongPolling, auto-reconnect) |
| SyncQueueService | Queue offline operations for sync |
| TournamentAdminService | Admin tournament CRUD |
| MatchAdminService | Admin match CRUD |
| ResultAdminService | Submit match results |
| AdminDashboardService | Dashboard stats + recent activity |

---

## FRONTEND COMPONENTS

### Auth
- LoginComponent — email/password login
- RegisterComponent — name/email/password registration

### Home
- HomeComponent — landing page

### Predictions
- PredictionsListComponent — matches with prediction status, competition/matchday filters, tabs
- PredictionFormComponent — score input with validation, deadline info
- MatchCardComponent — reusable match display card

### Leaderboard
- LeaderboardComponent — container with tabs
- OverallLeaderboardComponent — tournament-wide standings
- WeeklyLeaderboardComponent — weekly standings
- UserStatsComponent — personal stats

### Preferences
- CompetitionPreferencesComponent — checkbox list

### Admin
- AdminDashboardComponent — stats overview
- TournamentListComponent / TournamentFormComponent
- MatchListComponent / MatchFormComponent
- ResultEntryComponent — enter match scores

### Shared
- HeaderComponent — top navigation
- BottomNavigationComponent — mobile nav (Games, Statistics, Profile)
- CompetitionSelectorComponent — competition dropdown
- MatchStatusTabsComponent — Upcoming/Live/Completed tabs
- MatchdayFilterComponent — matchday selector
- CountdownTimerComponent — deadline countdown
- ScoreInputComponent — +/- score buttons
- OfflineIndicatorComponent — offline banner
- InstallPromptComponent — PWA install
- PointsInfoComponent — scoring rules
- StatusBadgeComponent — colored status badges
- TabNavigationComponent — reusable tabs
- UserStatsCardComponent — stats display
- ConfirmDialogComponent — confirmation modal

---

## GUARDS & INTERCEPTORS

- **authGuard**: Checks access_token in localStorage, redirects to /login
- **adminGuard**: Validates JWT role claim for "Admin", redirects to /
- **authInterceptor**: Adds Authorization: Bearer header
- **errorInterceptor**: Catches 401, clears auth, redirects to /login

---

## SCORING ALGORITHM

- Exact score match: +5 points
- Correct winner (not exact): +3 points
- Correct goal difference (not exact, not winner): +2 points
- Stage multiplier applied (knockout stages worth more)
- Weekly bonus for top performers

---

## REFERENCE COMMAND

```bash
git show version_1_06_02_2026:<filepath>
```
