# Football Prediction PWA - Reference Application

**Version**: 2.0
**Created**: 2026-03-05
**Status**: Complete Production Application

---

## 📊 Application Overview

### What Is This Application?

Football Prediction PWA is a web application where users predict football match scores and compete on leaderboards during tournament seasons.

**Core Value**: Friends compete to predict match outcomes across multiple competitions (Premier League, Champions League, etc.) with real-time scoring and leaderboards.

---

## 🎯 Key Features

### User Features
1. **Match Predictions** - Predict scores before kickoff
2. **Multiple Competitions** - Track 10+ football competitions
3. **Leaderboards** - Competition-specific and overall rankings
4. **Real-time Updates** - Live score updates via SignalR
5. **Offline Support** - PWA with offline prediction submission
6. **Mobile First** - Installable on mobile devices

### Admin Features
1. **Match Management** - Import matches from football-data.org API
2. **Result Entry** - Manual result entry (backup)
3. **User Management** - Admin/user roles
4. **Automatic Scoring** - Background job processes results

---

## 🏗️ Architecture

### Stack
- **Frontend**: Angular 19 PWA + Tailwind CSS
- **Backend**: .NET 9 Web API + Clean Architecture
- **Database**: PostgreSQL 16
- **Auth**: JWT (Bearer tokens)
- **Real-time**: SignalR
- **API**: football-data.org (match data)

### Pattern
**Clean Architecture** with 4 layers:
1. **Domain** - Entities, interfaces
2. **Application** - Business logic, DTOs
3. **Infrastructure** - Data access, external services
4. **API** - Controllers, authentication

---

## 📦 Project Structure

```
football-prediction-pwa/
├── backend/
│   ├── src/
│   │   ├── FootballPrediction.Api/           # REST API layer
│   │   ├── FootballPrediction.Application/   # Business logic
│   │   ├── FootballPrediction.Domain/        # Entities, interfaces
│   │   └── FootballPrediction.Infrastructure/ # Data access, EF Core
│   ├── tests/
│   │   ├── FootballPrediction.UnitTests/
│   │   └── FootballPrediction.IntegrationTests/
│   ├── FootballPrediction.sln
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, interceptors
│   │   │   ├── features/       # Feature modules (auth, matches, predictions, leaderboard)
│   │   │   ├── shared/         # Shared components, pipes
│   │   │   └── app.component.ts
│   │   ├── environments/
│   │   └── public/
│   ├── angular.json
│   ├── package.json
│   └── ngsw-config.json         # Service worker config
│
├── .spec_v_2/                   # THIS SPECIFICATION SYSTEM
├── .analysis/                   # Previous build lessons learned
├── PROGRESS.md
├── TEST-RESULTS.md
├── Dockerfile                   # Backend containerization
├── vercel.json                  # Frontend deployment
└── render.yaml                  # Backend deployment
```

---

## 🗄️ Database Schema

### Tables (8 total)

1. **Users** - User accounts
   - PK: Id
   - UQ: Email, Username
   - Columns: PasswordHash, RefreshToken, IsAdmin

2. **Tournaments** - Competitions (e.g., Premier League)
   - PK: Id
   - UQ: Code (e.g., "PL", "CL")
   - Columns: Name, Season, StartDate, EndDate

3. **GameWeeks** - Weekly periods within tournaments
   - PK: Id
   - FK: TournamentId
   - UQ: TournamentId + WeekNumber

4. **Matches** - Football matches
   - PK: Id
   - FK: TournamentId, GameWeekId (nullable)
   - Columns: HomeTeam, AwayTeam, KickoffTime, HomeScore, AwayScore
   - Status: SCHEDULED, IN_PLAY, FINISHED, etc.

5. **Predictions** - User predictions
   - PK: Id
   - FK: UserId, MatchId
   - UQ: UserId + MatchId (one prediction per user per match)
   - Columns: HomeScore, AwayScore, PointsEarned, Status

6. **WeeklyBonuses** - Bonus points (future)
   - PK: Id
   - FK: UserId, GameWeekId

7. **UserCompetitionStats** - Leaderboard data
   - PK: Id
   - FK: UserId
   - UQ: UserId + CompetitionCode
   - Columns: TotalPoints, TotalPredictions, Accuracy, Rank

8. **UserPreferences** - User settings
   - PK: Id
   - FK: UserId (UQ)
   - Columns: SelectedCompetitions (JSON)

---

## 🎮 Scoring System (CRITICAL)

**Source of Truth**: GAME-RULES.md

### Points Algorithm
```
IF prediction matches exact score:
    RETURN 5 points
ELSE IF correct winner AND correct goal difference:
    RETURN 4 points
ELSE IF correct winner only:
    RETURN 3 points
ELSE IF one team's score matches exactly:
    RETURN 1 point
ELSE:
    RETURN 0 points
```

### Example Predictions

| Predicted | Actual | Points | Reason |
|-----------|--------|--------|--------|
| 2-1 | 2-1 | 5 | Exact score |
| 1-0 | 2-1 | 4 | Correct winner + difference (both +1) |
| 2-0 | 3-1 | 3 | Correct winner only (different difference) |
| 2-1 | 1-1 | 1 | One score correct (away team) |
| 0-1 | 2-0 | 0 | No match |

**CRITICAL**: This must match the reference Java implementation exactly. The Flutter app has INCORRECT rules.

**Reference**: `C:\Projects\football-prediciton-game\src\main\java\com\example\footballprediction\service\ScoringService.java`

---

## 🔐 Authentication Flow

### Registration
1. User submits: username, email, password
2. Validate uniqueness (email, username)
3. Hash password with BCrypt (work factor 12)
4. Create User entity with role "User"
5. Generate JWT access token (60 min expiry)
6. Generate refresh token (7 days expiry)
7. Return tokens

### Login
1. User submits: email, password
2. Find user by email
3. Verify password with BCrypt
4. Generate new access + refresh tokens
5. Update refresh token in database
6. Return tokens

### Token Refresh
1. User submits: refresh token
2. Validate token not expired
3. Validate token matches database
4. Generate new access token
5. Rotate refresh token
6. Return new tokens

**Storage**: Access token in memory, refresh token in HttpOnly cookie (frontend)

---

## 📡 API Endpoints (31 total)

### Authentication (3)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Matches (7)
- `GET /api/matches` - List matches (with filters)
- `GET /api/matches/{id}` - Get match by ID
- `GET /api/matches/upcoming` - Upcoming matches
- `POST /api/matches` - Create match (admin)
- `PUT /api/matches/{id}` - Update match (admin)
- `DELETE /api/matches/{id}` - Delete match (admin)
- `POST /api/matches/{id}/result` - Enter result (admin)

### Predictions (5)
- `POST /api/predictions` - Submit prediction
- `GET /api/predictions/{id}` - Get prediction by ID
- `GET /api/predictions/user/{userId}` - Get user predictions
- `PUT /api/predictions/{id}` - Update prediction (before kickoff)
- `DELETE /api/predictions/{id}` - Delete prediction

### Leaderboard (2)
- `GET /api/leaderboard/competition/{code}` - Competition leaderboard
- `GET /api/leaderboard/overall` - Overall leaderboard

### Tournaments (5)
- `GET /api/tournaments` - List tournaments
- `GET /api/tournaments/{id}` - Get tournament
- `POST /api/tournaments` - Create tournament (admin)
- `PUT /api/tournaments/{id}` - Update tournament (admin)
- `DELETE /api/tournaments/{id}` - Delete tournament (admin)

### GameWeeks (5)
- `GET /api/gameweeks` - List game weeks
- `GET /api/gameweeks/current` - Current game week
- `POST /api/gameweeks` - Create game week (admin)
- `PUT /api/gameweeks/{id}` - Update game week (admin)
- `DELETE /api/gameweeks/{id}` - Delete game week (admin)

### User Preferences (2)
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences

### Health (1)
- `GET /health` - Backend health check

---

## 🔄 Background Jobs

### 1. Match Sync Job
**Frequency**: Every 6 hours
**Purpose**: Fetch match data from football-data.org
**Process**:
1. Call football-data.org API for each competition
2. Parse match JSON
3. Upsert matches to database
4. Update match statuses
5. Log results

**Rate Limit**: 10 calls/minute (free tier)

### 2. Result Processing Job
**Frequency**: Every 30 minutes
**Purpose**: Calculate prediction points for finished matches
**Process**:
1. Find finished matches with unscored predictions
2. For each prediction:
   - Calculate points using ScoringService
   - Update prediction status to SCORED
   - Update PointsEarned
3. Recalculate UserCompetitionStats
4. Update leaderboard rankings
5. Send SignalR updates

---

## 📱 PWA Features

### Installability
- **Manifest**: `manifest.webmanifest` with icons, theme
- **Service Worker**: Angular's `ngsw-worker.js`
- **Icons**: 192x192 and 512x512 PNG icons
- **Display**: `standalone` mode
- **HTTPS**: Required (Vercel provides)

### Offline Support
- **App Shell Caching**: HTML, CSS, JS files cached
- **API Caching**: Stale-while-revalidate for matches
- **Background Sync**: Offline predictions queued
- **Dexie.js**: IndexedDB for local prediction storage

### Installation Prompts
- **Chrome (Android)**: Automatic prompt after engagement
- **Safari (iOS)**: Manual via Share → Add to Home Screen
- **Desktop**: Browser's install button

---

## 🌐 Production Deployment

### Frontend - Vercel
- **URL**: https://football-prediction-pwa-erik-vms-projects.vercel.app/
- **Build**: `cd frontend && npm install && npm run build`
- **Output**: `frontend/dist/frontend/browser` (Angular 19)
- **SPA Routing**: Negative lookahead rewrite pattern
- **Cost**: $0/month (free tier)

### Backend - Render
- **URL**: https://football-prediction-pwa.onrender.com/api
- **Runtime**: Docker container (.NET 9)
- **Database**: PostgreSQL 16 (Render managed)
- **Environment Variables**: JWT secret, database URL, API keys
- **Cost**: $0/month (free tier, sleeps after 15min inactivity)

### Limitations (Free Tier)
- Backend sleeps after 15min (30s cold start)
- Database expires in 90 days
- Vercel: 100GB bandwidth/month
- football-data.org: 10 calls/minute

---

## 📊 Metrics

### Codebase Size
- **Backend**: ~20,000 lines of C# across 6 projects
- **Frontend**: ~15,000 lines of TypeScript/HTML/CSS
- **Tests**: 100+ unit tests, 10+ integration tests
- **Database**: 8 tables, 15+ indexes

### Performance
- **API Response**: < 100ms average
- **Page Load**: < 2 seconds on 4G
- **PWA Score**: Lighthouse 100/100
- **Build Time**: Backend 3min, Frontend 25sec

### Test Coverage
- **Backend**: 80%+ (xUnit + Moq)
- **Frontend**: 70%+ (Jasmine/Karma)
- **Critical Path**: 100% (scoring algorithm)

---

## 📚 Key Technologies

### Backend
- ASP.NET Core 9.0
- Entity Framework Core 9.0
- Npgsql.EntityFrameworkCore.PostgreSQL 9.0
- FluentValidation 11.3
- BCrypt.Net-Next 4.0
- Serilog 4.0
- xUnit 2.9
- Moq 4.20

### Frontend
- Angular 19.2
- TypeScript 5.7
- Tailwind CSS 3.4
- RxJS 7.8
- @microsoft/signalr 10.0
- Dexie 4.3
- Jasmine/Karma 5.x

### Infrastructure
- PostgreSQL 16
- Docker
- Vercel (frontend hosting)
- Render (backend hosting)
- football-data.org API

---

## 🎓 Learning Resources

### Reference Implementation (Correct)
**Location**: `C:\Projects\football-prediciton-game`
**Stack**: Spring Boot + React
**Use for**: Scoring logic, business rules, API design

### Incorrect Implementation (DO NOT USE)
**Location**: `C:\Projects\taltech\icd0011exercises\football_prediction_app`
**Stack**: Flutter
**Problem**: WRONG scoring rules
**Use for**: UI inspiration ONLY (not logic)

---

## 🔍 Common Patterns

### Repository Pattern
```csharp
public interface ITournamentRepository
{
    Task<IEnumerable<Tournament>> GetAllAsync();
    Task<Tournament?> GetByIdAsync(Guid id);
    Task<Tournament> AddAsync(Tournament tournament);
    Task UpdateAsync(Tournament tournament);
    Task DeleteAsync(Guid id);
}
```

### Service Layer
```csharp
public interface IScoringService
{
    int CalculatePoints(int predHome, int predAway, int actualHome, int actualAway);
}
```

### DTO Pattern
```csharp
public record CreatePredictionDto(Guid MatchId, int HomeScore, int AwayScore);
public record PredictionResponseDto(Guid Id, Guid MatchId, int HomeScore, int AwayScore, int? PointsEarned);
```

---

## ✅ Success Criteria

The application is **production-ready** when:

- ✅ All 31 API endpoints functional
- ✅ Scoring matches reference implementation (29 tests passing)
- ✅ PWA installable on mobile
- ✅ Leaderboards update automatically
- ✅ Offline predictions work
- ✅ Background jobs running
- ✅ Deployed to production (free tier)
- ✅ 0 warnings, 0 errors in build
- ✅ 100+ tests passing
- ✅ Clean git history with descriptive commits

---

## 📖 Next Steps

Now that you understand the reference application:

1. **Read GAME-RULES.md** - CRITICAL scoring algorithm
2. **Read TECH-STACK.md** - Technology versions and choices
3. **Read ARCHITECTURE.md** - Architectural patterns and decisions
4. **Read PHASE-WORKFLOW.md** - How to build it step-by-step

---

**Version**: 2.0
**Created**: 2026-03-05
**Source**: Production application at `C:\Projects\football-prediction-pwa`
**Status**: Complete reference documentation
