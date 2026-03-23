# Project Specification - Complete System Reference

## Entities & Relations

### User
| Property | Type | Constraints |
|----------|------|------------|
| Id | Guid | PK |
| Username | string(50) | Unique, required |
| Email | string(255) | Unique, required |
| PasswordHash | string | Required, BCrypt (cost 12) |
| RefreshToken | string? | Nullable |
| RefreshTokenExpiry | DateTime? | Nullable |
| IsAdmin | bool | Default false |
| CreatedAt | DateTime | UTC, auto-set |
| UpdatedAt | DateTime | UTC, auto-set |

**Relations**: User → many Predictions (cascade delete)

### Tournament
| Property | Type | Constraints |
|----------|------|------------|
| Id | Guid | PK |
| Name | string(200) | Required |
| Code | string(10) | Required (e.g., "PL", "CL") |
| Season | string(20) | Required (e.g., "2025-2026") |
| StartDate | DateTime | |
| EndDate | DateTime | |
| Country | string? | Nullable |
| Type | string? | "LEAGUE" or "CUP" |
| LogoUrl | string? | Nullable |
| CreatedAt | DateTime | UTC, auto-set |
| UpdatedAt | DateTime | UTC, auto-set |

**Unique constraint**: (Code, Season)
**Relations**: Tournament → many Matches, Tournament → many GameWeeks

### GameWeek
| Property | Type | Constraints |
|----------|------|------------|
| Id | Guid | PK |
| TournamentId | Guid | FK → Tournament, required |
| WeekNumber | int | Required |
| StartDate | DateTime | |
| EndDate | DateTime | |
| IsCurrent | bool | |
| CreatedAt | DateTime | UTC, auto-set |
| UpdatedAt | DateTime | UTC, auto-set |

**Unique constraint**: (TournamentId, WeekNumber)
**Relations**: GameWeek → many Matches (SetNull on delete)

### Match
| Property | Type | Constraints |
|----------|------|------------|
| Id | Guid | PK |
| TournamentId | Guid | FK → Tournament, required |
| GameWeekId | Guid? | FK → GameWeek, nullable |
| HomeTeam | string(100) | Required |
| AwayTeam | string(100) | Required |
| KickoffTime | DateTime | Required, indexed |
| HomeScore | int? | Populated when finished |
| AwayScore | int? | Populated when finished |
| Status | string(20) | Default "SCHEDULED" |
| CompetitionCode | string(10) | Required |
| Season | string | Required |
| Matchday | int? | Nullable |
| IsFinished | bool | Default false |
| CreatedAt | DateTime | UTC, auto-set |
| UpdatedAt | DateTime | UTC, auto-set |

**Status values**: SCHEDULED, IN_PLAY, FINISHED, POSTPONED, CANCELLED
**Indexes**: KickoffTime, Status, (TournamentId, GameWeekId)
**Relations**: Match → many Predictions (cascade delete)

### Prediction
| Property | Type | Constraints |
|----------|------|------------|
| Id | Guid | PK |
| UserId | Guid | FK → User, required |
| MatchId | Guid | FK → Match, required |
| HomeScore | int | Required |
| AwayScore | int | Required |
| PointsEarned | int? | Populated after scoring |
| Status | string(20) | Default "PENDING" |
| CompetitionCode | string(10) | Required |
| CreatedAt | DateTime | UTC, auto-set |
| UpdatedAt | DateTime | UTC, auto-set |

**Status values**: PENDING, SCORED
**Unique constraint**: (UserId, MatchId) - one prediction per user per match

## API Endpoints

### Auth (`/api/v1/auth`) - No authentication required
| Method | Route | Request | Response |
|--------|-------|---------|----------|
| POST | /register | RegisterRequest{username,email,password} | AuthResponse{accessToken,refreshToken,userId,username,email,isAdmin} |
| POST | /login | LoginRequest{email,password} | AuthResponse |
| POST | /refresh | RefreshTokenRequest{refreshToken} | AuthResponse |

### Tournaments (`/api/v1/tournaments`)
| Method | Route | Response |
|--------|-------|----------|
| GET | / | Tournament[] |
| GET | /{id} | Tournament |
| POST | / | Tournament (created) |
| PUT | /{id} | 204 NoContent |
| DELETE | /{id} | 204 NoContent |

### Matches (`/api/v1/matches`)
| Method | Route | Params | Response |
|--------|-------|--------|----------|
| GET | / | | Match[] |
| GET | /{id} | | Match |
| GET | /upcoming | | Match[] (future, not finished) |
| GET | /finished | | Match[] (finished, desc by kickoff) |
| GET | /filtered | ?competitionCode&matchday | Match[] |
| GET | /competitions | | string[] (distinct codes) |
| GET | /matchdays | ?competitionCode | int[] (distinct) |
| GET | /nearest-matchday | ?competitionCode&tab | int? |
| POST | / | Match body | Match (created) |
| PUT | /{id} | Match body | 204 NoContent |
| DELETE | /{id} | | 204 NoContent |
| POST | /sync | | {message} - syncs all competitions |
| POST | /cleanup-duplicates | | {message, count} |
| POST | /{id}/result | {homeScore,awayScore} | {message} - scores predictions |

### Predictions (`/api/v1/predictions`) - Requires JWT
| Method | Route | Response |
|--------|-------|----------|
| GET | /{id} | Prediction |
| GET | /my?userId={guid} | Prediction[] (user's predictions) |
| GET | /match/{matchId} | Prediction (current user's for match) |
| POST | / | Prediction (created). Validates: before kickoff, no duplicate |
| PUT | /{id} | 204. Only before kickoff |
| DELETE | /{id} | 204. Only before kickoff |

### Leaderboard (`/api/v1/leaderboard`)
| Method | Route | Response |
|--------|-------|----------|
| GET | /overall/{tournamentId} | LeaderboardEntry[] |
| GET | /competition/{competitionCode} | LeaderboardEntry[] |

**LeaderboardEntry**: {userId, username, totalPoints, totalPredictions, averagePoints, rank}

### Health
| Method | Route | Response |
|--------|-------|----------|
| GET | /health | 200 OK |

## Backend Services

| Service | Methods | Purpose |
|---------|---------|---------|
| AuthService | Register, Login, RefreshToken | User authentication with BCrypt + JWT |
| JwtTokenService | GenerateAccessToken, GenerateRefreshToken | JWT creation (HS256, 60min access, 7day refresh) |
| ScoringService | CalculatePoints | 5-tier scoring (see GAME-RULES.md) |
| LeaderboardService | GetOverallLeaderboard, GetByCompetition | Computed on-demand, grouped by user |
| FootballDataService | SyncAll, SyncMatches, UpdateScores, Cleanup | football-data.org API integration |
| MatchResultService | ProcessMatchResult | Manual result entry + auto-scoring |
| ResultProcessingService | ProcessFinishedMatches | Batch scoring safety net |

## Background Jobs

| Job | Interval | Purpose |
|-----|----------|---------|
| FootballDataSyncJob | 60 min (configurable) | Fetches latest match scores, triggers scoring |
| ResultProcessingBackgroundJob | 30 min | Safety net: scores any missed predictions |

## Frontend Views

### Login (`/login`)
- Email + password form
- Validation: email format, password required (min 6)
- On success: store tokens, navigate to /matches

### Register (`/register`)
- Username (3-50), email, password (8+, letter+digit), confirm password
- Password mismatch validator
- On success: auto-login, navigate to /matches

### Match List (`/matches`) - Protected
- Three tabs: Upcoming | Live | Completed (with counts)
- Competition selector dropdown (filtered by user preferences from localStorage)
- **Competition selection persisted to localStorage** — restored when returning to page
- Matchday filter dropdown
- Auto-selects nearest matchday for active tab
- Match cards show: teams, time/score, status badge, prediction if exists
- **Cards with predictions**: cyan background, show prediction score (e.g. "Your prediction: 2-1"), points badge if scored, "Edit Prediction" outline button
- **Cards without predictions**: white background, solid "Make Prediction" button
- Fetch user predictions on init via GET /predictions/my, build Map for O(1) lookup
- Click predict button → navigate to prediction form

### Prediction Form (`/predictions/new?matchId=`) - Protected
- Shows match info (teams, kickoff time)
- Score inputs (0-10) for home and away
- Countdown timer to deadline (updates every 30s)
- Points info tooltip (scoring rules)
- Edit mode if prediction exists
- Prevents submission after kickoff
- On success: navigate back to /matches

### My Predictions (`/predictions`) - Protected
- List of user's predictions with match info and points earned

### Leaderboard (`/leaderboard`)
- Competition selector (filtered by user preferences, selection persisted to localStorage)
- **Shares `last_selected_competition` key with match list** for consistent UX
- Current user stats card (rank, points, predictions, accuracy %)
- Ranked list with medals for top 3
- Highlights current user's row

### Tournaments (`/tournaments`) - Protected
- Tournament cards with View Matches and Leaderboard buttons

### Preferences (`/preferences`) - Protected
- User info display
- Competition checkboxes (select which competitions to show)
- Persists to localStorage key `selected_competitions` on every toggle
- **Must save initial state on first visit** (all selected) so other pages can read it
- Match list and leaderboard filter their dropdowns by this preference

### Header (all pages when logged in)
- App title (link to /matches)
- Sync button (triggers match data refresh)
- Theme toggle (dark/light)
- Settings link
- Logout button

### Bottom Navigation (mobile)
- Matches | Tournaments | Leaderboard | Predictions | Preferences

### App Layout
- `<router-outlet>` wrapped in `max-w-lg mx-auto` for desktop readability
- Mobile-first: full width on small screens, centered constrained width on desktop
- Header and bottom nav span full width outside the container

## Frontend Services

| Service | Methods |
|---------|---------|
| ApiService | get, post, put, delete (base HTTP wrapper) |
| AuthService | register, login, refreshToken, logout, getAccessToken; signals: isAuthenticated, currentUser |
| MatchService | getUpcoming, getFinished, getById, getFiltered, getCompetitions, getMatchdays, getNearestMatchday, syncMatches |
| PredictionService | getMyPredictions, getByMatchId, create, update, delete (with offline queue) |
| LeaderboardService | getOverall, getByTournament, getByCompetition |
| TournamentService | getAll, getById, getActive |
| StorageService | setItem, getItem, removeItem, setObject, getObject (localStorage wrapper) |
| OfflineService | isOnline signal, online/offline event handling |
| OfflineQueueService | Queue predictions when offline, sync on reconnect |

## Frontend Models

```typescript
// CRITICAL: All IDs are strings (backend Guid serializes as string). Never use number for IDs.

// Auth
RegisterRequest { username: string, email: string, password: string }
LoginRequest { email: string, password: string }
AuthResponse { accessToken: string, refreshToken: string, userId: string, username: string, email: string, isAdmin: boolean }

// Match
Match { id: string, tournamentId: string, gameWeekId: string | null, homeTeam: string, awayTeam: string, kickoffTime: string, homeScore: number | null, awayScore: number | null, isFinished: boolean, status: string, competitionCode: string, season: string, matchday: number }
Tournament { id: string, name: string, code: string, season: string, startDate: string, endDate: string, country: string | null, type: string | null, logoUrl: string | null }

// Prediction
Prediction { id: string, userId: string, matchId: string, homeScore: number, awayScore: number, pointsEarned: number | null, status: string, competitionCode: string, createdAt: string, updatedAt: string, match?: Match }
PredictionRequest { userId?: string, matchId: string, homeScore: number, awayScore: number }

// Leaderboard
LeaderboardEntry { userId: string, username: string, totalPoints: number, totalPredictions: number, averagePoints: number, accuracy: number, rank: number }
```

## Supported Competitions

| Code | Name |
|------|------|
| PL | Premier League |
| PD | La Liga |
| BL1 | Bundesliga |
| SA | Serie A |
| FL1 | Ligue 1 |
| CL | UEFA Champions League |
| PPL | Primeira Liga |
| DED | Eredivisie |
| ELC | Championship |
| BSA | Brasileirao |
| WC | FIFA World Cup |
| EC | European Championship |
