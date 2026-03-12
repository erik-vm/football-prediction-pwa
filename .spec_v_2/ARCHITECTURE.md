# Football Prediction PWA - Architecture Documentation

**Version**: 2.0
**Purpose**: Comprehensive architectural overview of the Football Prediction PWA
**Audience**: All agents building or maintaining the application

---

## 🎯 ARCHITECTURE OVERVIEW

### Application Purpose
A Progressive Web Application (PWA) that allows users to predict football match scores and compete on leaderboards across multiple competitions.

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (PWA)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Angular 19 Standalone Components             │   │
│  │  - Auth UI    - Match Lists    - Prediction Form     │   │
│  │  - Leaderboard - User Settings - PWA Features        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Worker (Offline)                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         HTTP Client + SignalR (Real-time)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTPS │ WSS (SignalR)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (.NET 9)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 API Controllers                      │   │
│  │  - Auth  - Matches  - Predictions  - Leaderboard    │   │
│  │  - Competitions  - Users                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Middleware (JWT, CORS, Logging)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SignalR Hubs (Real-time)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER (.NET 9)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Application Services                    │   │
│  │  - Auth Service   - Scoring Service                  │   │
│  │  - Prediction Service  - Leaderboard Service         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Background Jobs (Hangfire)                  │   │
│  │  - Match Sync (6h)  - Result Processing (30m)       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DOMAIN LAYER (.NET 9)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Domain Entities                     │   │
│  │  - User  - Match  - Prediction  - Tournament        │   │
│  │  - GameWeek  - Competition  - Stage                 │   │
│  │  - UserCompetitionStats                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Rules & Logic                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE LAYER (.NET 9)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Entity Framework Core 9 (ORM)                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Repository Pattern                      │   │
│  │  - User Repo  - Match Repo  - Prediction Repo       │   │
│  │  - Tournament Repo  - GameWeek Repo                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         External API Integration                     │   │
│  │         (football-data.org)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER (PostgreSQL 16)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   8 Tables:                          │   │
│  │  - Users  - Matches  - Predictions  - Tournaments   │   │
│  │  - GameWeeks  - Competitions  - Stages              │   │
│  │  - UserCompetitionStats                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ BACKEND ARCHITECTURE (Clean Architecture)

### Solution Structure
```
FootballPrediction.sln
├── src/
│   ├── FootballPrediction.Domain/          (Core business entities)
│   ├── FootballPrediction.Application/     (Business logic & services)
│   ├── FootballPrediction.Infrastructure/  (Data access & external APIs)
│   └── FootballPrediction.Api/             (Web API & controllers)
├── tests/
│   ├── FootballPrediction.Domain.Tests/
│   ├── FootballPrediction.Application.Tests/
│   └── FootballPrediction.Api.Tests/
└── docker-compose.yml                      (PostgreSQL container)
```

### Layer Responsibilities

#### 1. Domain Layer (`FootballPrediction.Domain`)
**Purpose**: Core business entities and domain logic (no dependencies)

**Entities**:
```csharp
// src/FootballPrediction.Domain/Entities/

User.cs
- Id (int, PK)
- Username (string, unique)
- Email (string, unique)
- PasswordHash (string)
- DisplayName (string)
- CreatedAt (DateTime)
- RefreshTokens (collection)

Match.cs
- Id (int, PK)
- HomeTeam (string)
- AwayTeam (string)
- HomeScore (int?, nullable until finished)
- AwayScore (int?, nullable until finished)
- KickoffTime (DateTime)
- IsFinished (bool)
- CompetitionCode (string)
- GameWeekId (int?, FK, nullable)
- StageId (int?, FK, nullable)
- Predictions (collection)

Prediction.cs
- Id (int, PK)
- UserId (int, FK)
- MatchId (int, FK)
- HomeScore (int)
- AwayScore (int)
- PointsEarned (int)
- Status (PredictionStatus enum: PENDING/CORRECT/INCORRECT)
- CreatedAt (DateTime)
- User (navigation)
- Match (navigation)

Tournament.cs
- Id (int, PK)
- Name (string)
- CompetitionCode (string, unique)
- StartDate (DateTime)
- EndDate (DateTime)
- IsActive (bool)
- GameWeeks (collection)

GameWeek.cs
- Id (int, PK)
- TournamentId (int, FK)
- WeekNumber (int)
- StartDate (DateTime)
- EndDate (DateTime)
- Tournament (navigation)
- Matches (collection)

Competition.cs
- Id (int, PK)
- Code (string, PK, e.g., "PL", "CL")
- Name (string)
- Area (string)
- EmblemUrl (string, nullable)

Stage.cs
- Id (int, PK)
- Name (string, e.g., "GROUP_STAGE", "FINAL")
- Multiplier (decimal, e.g., 1.0, 2.0, 5.0)

UserCompetitionStats.cs
- Id (int, PK)
- UserId (int, FK)
- CompetitionCode (string)
- TotalPoints (int)
- TotalPredictions (int)
- CorrectPredictions (int)
- Accuracy (decimal, calculated)
- Rank (int)
- User (navigation)
```

**Enums**:
```csharp
PredictionStatus { PENDING, CORRECT, INCORRECT }
```

**No Dependencies**: Domain layer has ZERO external dependencies. It's pure C# with domain logic only.

---

#### 2. Application Layer (`FootballPrediction.Application`)
**Purpose**: Business logic, services, use cases

**Dependencies**: Only depends on Domain layer

**Services**:
```csharp
// Services/

IScoringService.cs / ScoringService.cs
- CalculatePoints(predHome, predAway, actualHome, actualAway, multiplier)
  Returns: int (0, 1, 3, 4, 5 points * multiplier)

- Rules:
  1. Exact score → 5 points
  2. Correct winner + correct goal difference → 4 points
  3. Correct winner → 3 points
  4. Correct score for one team → 1 point
  5. Otherwise → 0 points
  6. Multiply by stage multiplier (GROUP=1x, R16=2x, QF=3x, SF=4x, FINAL=5x)

IAuthenticationService.cs / AuthenticationService.cs
- RegisterUser(username, email, password) → Task<User>
- Login(username, password) → Task<TokenResponse>
- RefreshToken(refreshToken) → Task<TokenResponse>
- HashPassword(password) → string (BCrypt, work factor 12)
- VerifyPassword(password, hash) → bool

IPredictionService.cs / PredictionService.cs
- SubmitPrediction(userId, matchId, homeScore, awayScore) → Task<Prediction>
- GetUserPredictions(userId, competitionCode?, status?) → Task<List<Prediction>>
- UpdatePrediction(predictionId, homeScore, awayScore) → Task<Prediction>
- DeletePrediction(predictionId) → Task

ILeaderboardService.cs / LeaderboardService.cs
- GetCompetitionLeaderboard(competitionCode) → Task<List<LeaderboardEntry>>
- GetGlobalLeaderboard() → Task<List<LeaderboardEntry>>
- UpdateUserCompetitionStats(userId, competitionCode) → Task
- RecalculateRankings(competitionCode) → Task

IMatchService.cs / MatchService.cs
- GetMatches(competitionCode?, isFinished?, startDate?, endDate?) → Task<List<Match>>
- GetMatchById(matchId) → Task<Match>
- SyncMatchesFromApi() → Task (calls football-data.org)
- UpdateMatchResult(matchId, homeScore, awayScore) → Task

IResultProcessingService.cs / ResultProcessingService.cs
- ProcessFinishedMatches() → Task
  - Find all finished matches with pending predictions
  - Calculate points for each prediction using ScoringService
  - Update prediction status (CORRECT/INCORRECT)
  - Update UserCompetitionStats for affected users
  - Recalculate leaderboard rankings
```

**DTOs (Data Transfer Objects)**:
```csharp
// DTOs/

RegisterRequest { Username, Email, Password }
LoginRequest { Username, Password }
TokenResponse { AccessToken, RefreshToken, ExpiresIn }
PredictionRequest { MatchId, HomeScore, AwayScore }
LeaderboardEntry { UserId, Username, CompetitionCode, TotalPoints, Rank, Accuracy }
MatchDto { Id, HomeTeam, AwayTeam, KickoffTime, IsFinished, ... }
```

---

#### 3. Infrastructure Layer (`FootballPrediction.Infrastructure`)
**Purpose**: Data access, external APIs, infrastructure concerns

**Dependencies**: Depends on Domain and Application layers

**DbContext**:
```csharp
// Data/ApplicationDbContext.cs

public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<Prediction> Predictions { get; set; }
    public DbSet<Tournament> Tournaments { get; set; }
    public DbSet<GameWeek> GameWeeks { get; set; }
    public DbSet<Competition> Competitions { get; set; }
    public DbSet<Stage> Stages { get; set; }
    public DbSet<UserCompetitionStats> UserCompetitionStats { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply entity configurations from separate files
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
```

**Entity Configurations**:
```csharp
// Data/Configurations/

UserConfiguration.cs
- Username: Required, MaxLength 50, Unique index
- Email: Required, MaxLength 100, Unique index
- PasswordHash: Required, MaxLength 255
- DisplayName: MaxLength 100

MatchConfiguration.cs
- HomeTeam: Required, MaxLength 100
- AwayTeam: Required, MaxLength 100
- CompetitionCode: Required, MaxLength 10
- IsFinished: Default false
- Relationships: Many Predictions, Optional GameWeek, Optional Stage

PredictionConfiguration.cs
- Composite index on (UserId, MatchId) for uniqueness
- Relationships: One User, One Match
- Default Status: PENDING

(Similar configurations for other entities)
```

**Repositories**:
```csharp
// Repositories/

IUserRepository.cs / UserRepository.cs
- GetByIdAsync(id) → Task<User?>
- GetByUsernameAsync(username) → Task<User?>
- GetByEmailAsync(email) → Task<User?>
- CreateAsync(user) → Task<User>
- UpdateAsync(user) → Task
- ExistsAsync(username, email) → Task<bool>

IMatchRepository.cs / MatchRepository.cs
- GetByIdAsync(id) → Task<Match?>
- GetAllAsync(competitionCode?, isFinished?, startDate?, endDate?) → Task<List<Match>>
- GetUpcomingAsync(competitionCode?) → Task<List<Match>>
- GetFinishedAsync(competitionCode?) → Task<List<Match>>
- CreateAsync(match) → Task<Match>
- UpdateAsync(match) → Task
- BulkCreateAsync(matches) → Task

IPredictionRepository.cs / PredictionRepository.cs
- GetByIdAsync(id) → Task<Prediction?>
- GetByUserIdAsync(userId, competitionCode?, status?) → Task<List<Prediction>>
- GetByMatchIdAsync(matchId) → Task<List<Prediction>>
- GetPendingForFinishedMatches() → Task<List<Prediction>>
- CreateAsync(prediction) → Task<Prediction>
- UpdateAsync(prediction) → Task
- DeleteAsync(id) → Task

(Similar repositories for Tournament, GameWeek, Competition, Stage, UserCompetitionStats)
```

**External API Integration**:
```csharp
// ExternalApis/FootballDataApiClient.cs

public class FootballDataApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    // GET /v4/competitions
    public async Task<List<CompetitionDto>> GetCompetitionsAsync()

    // GET /v4/competitions/{code}/matches
    public async Task<List<MatchDto>> GetMatchesByCompetitionAsync(string competitionCode)

    // GET /v4/matches/{id}
    public async Task<MatchDto> GetMatchByIdAsync(int matchId)
}
```

**Background Jobs** (Hangfire):
```csharp
// BackgroundJobs/

MatchSyncJob.cs
- Execute() → Task
  - Calls FootballDataApiClient to fetch latest matches
  - Updates database with new matches
  - Runs every 6 hours

ResultProcessingJob.cs
- Execute() → Task
  - Finds finished matches with pending predictions
  - Calculates points using ScoringService
  - Updates UserCompetitionStats
  - Recalculates leaderboard rankings
  - Runs every 30 minutes
```

---

#### 4. API Layer (`FootballPrediction.Api`)
**Purpose**: HTTP endpoints, SignalR hubs, middleware

**Dependencies**: Depends on all other layers

**Controllers**:
```csharp
// Controllers/

AuthController.cs
- POST   /api/auth/register       → Register new user
- POST   /api/auth/login          → Login (returns JWT + refresh token)
- POST   /api/auth/refresh        → Refresh access token
- POST   /api/auth/logout         → Revoke refresh token
- GET    /api/auth/me             → Get current user [Authorize]

MatchesController.cs
- GET    /api/matches                           → Get matches (filter by competition, status)
- GET    /api/matches/{id}                      → Get match by ID
- GET    /api/matches/upcoming                  → Get upcoming matches
- GET    /api/matches/finished                  → Get finished matches
- GET    /api/matches/competition/{code}        → Get matches by competition
- POST   /api/matches/{id}/result [Authorize(Admin)] → Update match result

PredictionsController.cs
- GET    /api/predictions                       → Get user's predictions [Authorize]
- GET    /api/predictions/{id}                  → Get prediction by ID [Authorize]
- POST   /api/predictions                       → Submit prediction [Authorize]
- PUT    /api/predictions/{id}                  → Update prediction [Authorize]
- DELETE /api/predictions/{id}                  → Delete prediction [Authorize]
- GET    /api/predictions/match/{matchId}       → Get user's prediction for match [Authorize]

LeaderboardController.cs
- GET    /api/leaderboard                       → Get global leaderboard
- GET    /api/leaderboard/competition/{code}    → Get competition leaderboard
- GET    /api/leaderboard/user/{userId}         → Get user's rank and stats

CompetitionsController.cs
- GET    /api/competitions                      → Get all competitions
- GET    /api/competitions/{code}               → Get competition by code
- POST   /api/competitions [Authorize(Admin)]   → Create competition
- PUT    /api/competitions/{code} [Authorize(Admin)] → Update competition

UsersController.cs
- GET    /api/users/{id}                        → Get user profile [Authorize]
- PUT    /api/users/{id}                        → Update user profile [Authorize]
- GET    /api/users/{id}/predictions            → Get user's predictions [Authorize]
- GET    /api/users/{id}/stats                  → Get user's statistics [Authorize]
```

**SignalR Hubs**:
```csharp
// Hubs/MatchHub.cs

public class MatchHub : Hub
{
    // Client → Server
    public async Task JoinMatchGroup(int matchId)
    public async Task LeaveMatchGroup(int matchId)

    // Server → Client (called by backend services)
    public async Task MatchUpdated(int matchId, MatchDto match)
    public async Task MatchFinished(int matchId, MatchDto match)
    public async Task LiveScore(int matchId, int homeScore, int awayScore)
}

// Usage in background job:
// await _hubContext.Clients.Group($"match-{matchId}").SendAsync("MatchUpdated", match);
```

**Middleware**:
```csharp
// Middleware/

JwtAuthenticationMiddleware
- Validates JWT tokens on protected routes
- Extracts user claims from token
- Sets HttpContext.User

ErrorHandlingMiddleware
- Catches all exceptions
- Returns standardized error responses
- Logs errors

LoggingMiddleware
- Logs all HTTP requests/responses
- Includes request ID for correlation

CorsMiddleware (configured in Program.cs)
- Allows frontend origin
- Allows credentials (for cookies)
- Allows specific headers
```

**Program.cs Configuration**:
```csharp
// Key configurations:

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* JWT config */ });

// CORS
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://frontend-url.vercel.app")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod()));

// Hangfire (Background Jobs)
builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(connectionString));
builder.Services.AddHangfireServer();

// SignalR
builder.Services.AddSignalR();

// Swagger
builder.Services.AddSwaggerGen();

// Dependency Injection
builder.Services.AddScoped<IScoringService, ScoringService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
// ... all other services and repositories

// Middleware pipeline
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<MatchHub>("/hubs/matches");
app.UseHangfireDashboard("/hangfire");

// Schedule background jobs
RecurringJob.AddOrUpdate<MatchSyncJob>("match-sync", job => job.Execute(), "0 */6 * * *");  // Every 6 hours
RecurringJob.AddOrUpdate<ResultProcessingJob>("result-processing", job => job.Execute(), "*/30 * * * *");  // Every 30 minutes
```

---

## 🎨 FRONTEND ARCHITECTURE (Angular 19)

### Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    (Singleton services, guards, interceptors)
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── api.service.ts
│   │   │   │   └── signalr.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── models/              (TypeScript interfaces)
│   │   │       ├── user.model.ts
│   │   │       ├── match.model.ts
│   │   │       ├── prediction.model.ts
│   │   │       └── leaderboard.model.ts
│   │   │
│   │   ├── features/                (Feature modules - standalone components)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       ├── register.component.html
│   │   │   │       └── register.component.scss
│   │   │   │
│   │   │   ├── matches/
│   │   │   │   ├── match-list/
│   │   │   │   │   ├── match-list.component.ts
│   │   │   │   │   ├── match-list.component.html
│   │   │   │   │   └── match-list.component.scss
│   │   │   │   ├── match-card/
│   │   │   │   └── match-filters/
│   │   │   │
│   │   │   ├── predictions/
│   │   │   │   ├── prediction-form/
│   │   │   │   ├── prediction-list/
│   │   │   │   └── prediction-card/
│   │   │   │
│   │   │   ├── leaderboard/
│   │   │   │   ├── leaderboard-table/
│   │   │   │   └── competition-selector/
│   │   │   │
│   │   │   └── user/
│   │   │       ├── user-profile/
│   │   │       ├── user-stats/
│   │   │       └── user-settings/
│   │   │
│   │   ├── shared/                  (Reusable components, pipes, directives)
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── error-message/
│   │   │   ├── pipes/
│   │   │   │   ├── date-format.pipe.ts
│   │   │   │   └── competition-name.pipe.ts
│   │   │   └── directives/
│   │   │
│   │   ├── app.component.ts         (Root component)
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.routes.ts            (Routing configuration)
│   │
│   ├── assets/                      (Static assets)
│   │   ├── icons/
│   │   │   ├── icon-72x72.png
│   │   │   ├── icon-96x96.png
│   │   │   ├── icon-128x128.png
│   │   │   ├── icon-144x144.png
│   │   │   ├── icon-152x152.png
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-384x384.png
│   │   │   └── icon-512x512.png
│   │   └── images/
│   │
│   ├── manifest.webmanifest          (PWA manifest)
│   ├── ngsw-config.json              (Service worker config)
│   ├── index.html
│   ├── styles.scss                   (Global styles + Tailwind)
│   └── main.ts                       (Bootstrap)
│
├── angular.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### Core Services

#### AuthService
```typescript
// core/services/auth.service.ts

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);

  register(username: string, email: string, password: string): Observable<User>
  login(username: string, password: string): Observable<TokenResponse>
  logout(): void
  refreshToken(): Observable<TokenResponse>
  getCurrentUser(): Observable<User>

  // Token management
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(accessToken: string, refreshToken: string): void
  clearTokens(): void
  isTokenExpired(): boolean
}
```

#### ApiService
```typescript
// core/services/api.service.ts

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE_URL = environment.apiUrl;

  // Matches
  getMatches(competitionCode?: string, isFinished?: boolean): Observable<Match[]>
  getMatchById(id: number): Observable<Match>
  getUpcomingMatches(competitionCode?: string): Observable<Match[]>
  getFinishedMatches(competitionCode?: string): Observable<Match[]>

  // Predictions
  getPredictions(): Observable<Prediction[]>
  submitPrediction(matchId: number, homeScore: number, awayScore: number): Observable<Prediction>
  updatePrediction(id: number, homeScore: number, awayScore: number): Observable<Prediction>
  deletePrediction(id: number): Observable<void>

  // Leaderboard
  getLeaderboard(competitionCode?: string): Observable<LeaderboardEntry[]>

  // Competitions
  getCompetitions(): Observable<Competition[]>

  // Users
  getUserProfile(id: number): Observable<User>
  updateUserProfile(id: number, data: Partial<User>): Observable<User>
}
```

#### SignalRService
```typescript
// core/services/signalr.service.ts

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: HubConnection;

  matchUpdated$ = new Subject<Match>();
  matchFinished$ = new Subject<Match>();
  liveScore$ = new Subject<{ matchId: number; homeScore: number; awayScore: number }>();

  startConnection(): Promise<void>
  stopConnection(): Promise<void>
  joinMatchGroup(matchId: number): Promise<void>
  leaveMatchGroup(matchId: number): Promise<void>

  private setupEventHandlers(): void {
    this.hubConnection.on('MatchUpdated', (match) => this.matchUpdated$.next(match));
    this.hubConnection.on('MatchFinished', (match) => this.matchFinished$.next(match));
    this.hubConnection.on('LiveScore', (data) => this.liveScore$.next(data));
  }
}
```

### Routing Configuration

```typescript
// app.routes.ts

export const routes: Routes = [
  { path: '', redirectTo: '/matches', pathMatch: 'full' },

  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Protected routes (require authentication)
  {
    path: 'matches',
    loadComponent: () => import('./features/matches/match-list/match-list.component').then(m => m.MatchListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'predictions',
    loadComponent: () => import('./features/predictions/prediction-list/prediction-list.component').then(m => m.PredictionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard-table/leaderboard-table.component').then(m => m.LeaderboardTableComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard]
  },

  // Fallback
  { path: '**', redirectTo: '/matches' }
];
```

### PWA Configuration

#### manifest.webmanifest
```json
{
  "name": "Football Prediction PWA",
  "short_name": "Football Pred",
  "theme_color": "#1976d2",
  "background_color": "#fafafa",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

#### Service Worker (ngsw-config.json)
```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-matches",
      "urls": ["/api/matches/**"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "5s",
        "strategy": "freshness"
      }
    },
    {
      "name": "api-competitions",
      "urls": ["/api/competitions/**"],
      "cacheConfig": {
        "maxSize": 50,
        "maxAge": "1d",
        "strategy": "performance"
      }
    }
  ]
}
```

---

## 💾 DATABASE ARCHITECTURE

### Schema Diagram
```
┌─────────────────────┐         ┌─────────────────────┐
│      Users          │         │    Competitions     │
├─────────────────────┤         ├─────────────────────┤
│ Id (PK)             │         │ Id (PK)             │
│ Username (UQ)       │         │ Code (UQ)           │
│ Email (UQ)          │         │ Name                │
│ PasswordHash        │         │ Area                │
│ DisplayName         │         │ EmblemUrl           │
│ CreatedAt           │         └─────────────────────┘
└─────────────────────┘
         │                               │
         │                               │ CompetitionCode (FK)
         │                               │
         │ UserId (FK)              ┌────▼────────────────┐
         ├──────────────────────────►    Matches          │
         │                          ├─────────────────────┤
         │                          │ Id (PK)             │
         │                          │ HomeTeam            │
         │                          │ AwayTeam            │
         │                          │ HomeScore (null)    │
         │                          │ AwayScore (null)    │
         │                          │ KickoffTime         │
         │                          │ IsFinished          │
         │                          │ CompetitionCode(FK) │
         │                          │ GameWeekId (FK)     │
         │                          │ StageId (FK)        │
         │                          └─────────────────────┘
         │                                    │
         │                                    │ MatchId (FK)
         │                                    │
         │                          ┌─────────▼──────────┐
         └──────────────────────────►   Predictions      │
                                    ├────────────────────┤
                                    │ Id (PK)            │
                                    │ UserId (FK)        │
                                    │ MatchId (FK)       │
                                    │ HomeScore          │
                                    │ AwayScore          │
                                    │ PointsEarned       │
                                    │ Status (enum)      │
                                    │ CreatedAt          │
                                    └────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│    Tournaments      │         │      Stages         │
├─────────────────────┤         ├─────────────────────┤
│ Id (PK)             │         │ Id (PK)             │
│ Name                │         │ Name                │
│ CompetitionCode(UQ) │         │ Multiplier          │
│ StartDate           │         └─────────────────────┘
│ EndDate             │                   │
│ IsActive            │                   │ StageId (FK)
└─────────────────────┘                   │
         │                                │
         │ TournamentId (FK)              │
         │                                │
         ▼                                │
┌─────────────────────┐                  │
│     GameWeeks       │                  │
├─────────────────────┤                  │
│ Id (PK)             │                  │
│ TournamentId (FK)   │◄─────────────────┘
│ WeekNumber          │     (Matches reference both)
│ StartDate           │
│ EndDate             │
└─────────────────────┘

┌──────────────────────────┐
│ UserCompetitionStats     │
├──────────────────────────┤
│ Id (PK)                  │
│ UserId (FK)              │
│ CompetitionCode          │
│ TotalPoints              │
│ TotalPredictions         │
│ CorrectPredictions       │
│ Accuracy (calculated)    │
│ Rank                     │
└──────────────────────────┘
```

### Key Relationships

1. **User → Prediction**: One-to-Many
   - Each user can have many predictions
   - Each prediction belongs to one user

2. **Match → Prediction**: One-to-Many
   - Each match can have many predictions (one per user)
   - Each prediction is for one specific match

3. **Competition → Match**: One-to-Many
   - Each competition has many matches
   - Each match belongs to one competition

4. **Tournament → GameWeek**: One-to-Many
   - Each tournament has many game weeks
   - Each game week belongs to one tournament

5. **GameWeek → Match**: One-to-Many (optional)
   - Each game week can have many matches
   - Matches may or may not belong to a game week

6. **Stage → Match**: One-to-Many (optional)
   - Each stage (GROUP, FINAL, etc.) can have many matches
   - Matches may or may not belong to a stage

7. **User → UserCompetitionStats**: One-to-Many
   - Each user has stats for multiple competitions
   - Stats tracked per user per competition

### Indexes

```sql
-- Users
CREATE UNIQUE INDEX idx_users_username ON "Users"("Username");
CREATE UNIQUE INDEX idx_users_email ON "Users"("Email");

-- Matches
CREATE INDEX idx_matches_competition ON "Matches"("CompetitionCode");
CREATE INDEX idx_matches_kickoff ON "Matches"("KickoffTime");
CREATE INDEX idx_matches_finished ON "Matches"("IsFinished");

-- Predictions
CREATE UNIQUE INDEX idx_predictions_user_match ON "Predictions"("UserId", "MatchId");
CREATE INDEX idx_predictions_status ON "Predictions"("Status");

-- UserCompetitionStats
CREATE UNIQUE INDEX idx_stats_user_competition ON "UserCompetitionStats"("UserId", "CompetitionCode");
CREATE INDEX idx_stats_competition_rank ON "UserCompetitionStats"("CompetitionCode", "Rank");
```

---

## 🔐 SECURITY ARCHITECTURE

### Authentication Flow

```
1. User Registration
   User → POST /api/auth/register { username, email, password }
   → Backend hashes password (BCrypt, work factor 12)
   → Saves user to database
   → Returns User object (no password)

2. User Login
   User → POST /api/auth/login { username, password }
   → Backend verifies password (BCrypt)
   → Generates JWT access token (expires in 15 minutes)
   → Generates refresh token (expires in 7 days)
   → Saves refresh token to database (tied to user)
   → Returns { accessToken, refreshToken, expiresIn }
   → Frontend stores tokens in localStorage

3. Authenticated Request
   User → GET /api/predictions (with Authorization: Bearer {accessToken})
   → Backend validates JWT signature
   → Backend checks expiration
   → Backend extracts user claims (userId, username)
   → Sets HttpContext.User
   → Proceeds with request

4. Token Refresh
   User → POST /api/auth/refresh { refreshToken }
   → Backend validates refresh token exists in database
   → Backend checks expiration
   → Generates new access token (15 minutes)
   → Generates new refresh token (7 days)
   → Revokes old refresh token
   → Returns new tokens
   → Frontend updates localStorage

5. Logout
   User → POST /api/auth/logout { refreshToken }
   → Backend revokes refresh token (marks as used)
   → Frontend clears localStorage
   → User logged out
```

### JWT Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "123",
    "username": "john_doe",
    "email": "john@example.com",
    "exp": 1234567890,
    "iat": 1234567000,
    "iss": "FootballPredictionAPI",
    "aud": "FootballPredictionPWA"
  },
  "signature": "..."
}
```

### Authorization Policies

```csharp
// Default policy: Authenticated users only
[Authorize]

// Admin policy: Users with "Admin" role
[Authorize(Roles = "Admin")]

// Owner policy: Users can only access their own resources
// Implemented in controller logic:
if (userId != HttpContext.User.FindFirst("sub")?.Value)
    return Forbid();
```

### Security Best Practices

1. **Password Security**:
   - BCrypt with work factor 12
   - Minimum 8 characters
   - Never store plain text passwords
   - Never log passwords

2. **Token Security**:
   - Short-lived access tokens (15 minutes)
   - Rotate refresh tokens on each use
   - Revoke refresh tokens on logout
   - Store tokens securely (HTTPS only)

3. **API Security**:
   - HTTPS required (redirect HTTP to HTTPS)
   - CORS configured (specific origin only)
   - Rate limiting (TODO: Phase 20+)
   - Input validation on all endpoints
   - SQL injection prevention (parameterized queries via EF Core)

4. **Data Protection**:
   - Users can only access their own predictions
   - Match results only editable by admins
   - Sensitive data not exposed in API responses
   - Error messages don't leak implementation details

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                          CLIENT                              │
│                    (Browser / Mobile)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel CDN                              │
│              (Frontend Hosting - FREE)                       │
│  - Angular 19 PWA                                           │
│  - Global CDN                                               │
│  - Automatic HTTPS                                          │
│  - Environment: production                                  │
│  - API URL: https://backend.onrender.com                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS API calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Render Web Service                        │
│               (Backend Hosting - FREE)                       │
│  - .NET 9 Web API                                           │
│  - Docker container                                          │
│  - Automatic deployments (git push)                         │
│  - Health checks                                            │
│  - Environment variables                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ PostgreSQL connection
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Render PostgreSQL Database                   │
│                  (Database - FREE)                           │
│  - PostgreSQL 16                                            │
│  - Automatic backups (7 days)                               │
│  - 1 GB storage                                             │
│  - Connection pooling                                       │
└─────────────────────────────────────────────────────────────┘
```

### Environment Variables

**Backend (Render)**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<random-256-bit-secret>
JWT_ISSUER=FootballPredictionAPI
JWT_AUDIENCE=FootballPredictionPWA
JWT_EXPIRES_MINUTES=15
REFRESH_TOKEN_EXPIRES_DAYS=7
FOOTBALL_DATA_API_KEY=<api-key-from-football-data.org>
ASPNETCORE_ENVIRONMENT=Production
CORS_ORIGIN=https://frontend-url.vercel.app
```

**Frontend (Vercel)**:
```bash
NG_APP_API_URL=https://backend.onrender.com
NG_APP_ENV=production
```

### Dockerfile (Backend)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/FootballPrediction.Api/FootballPrediction.Api.csproj", "src/FootballPrediction.Api/"]
COPY ["src/FootballPrediction.Application/FootballPrediction.Application.csproj", "src/FootballPrediction.Application/"]
COPY ["src/FootballPrediction.Domain/FootballPrediction.Domain.csproj", "src/FootballPrediction.Domain/"]
COPY ["src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj", "src/FootballPrediction.Infrastructure/"]
RUN dotnet restore "src/FootballPrediction.Api/FootballPrediction.Api.csproj"
COPY . .
WORKDIR "/src/src/FootballPrediction.Api"
RUN dotnet build "FootballPrediction.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FootballPrediction.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FootballPrediction.Api.dll"]
```

### render.yaml

```yaml
services:
  - type: web
    name: football-prediction-api
    env: docker
    dockerfilePath: ./Dockerfile
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: football-prediction-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ASPNETCORE_ENVIRONMENT
        value: Production

databases:
  - name: football-prediction-db
    databaseName: football_prediction
    user: football_user
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/frontend/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|svg|ico|json|txt|woff|woff2|ttf|eot))",
      "headers": { "cache-control": "public, max-age=31536000, immutable" },
      "dest": "/$1"
    },
    {
      "src": "/(ngsw-worker\\.js|ngsw\\.json|manifest\\.webmanifest)",
      "headers": { "cache-control": "no-cache" },
      "dest": "/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

---

## 📊 DATA FLOW

### Match Prediction Flow

```
1. User views upcoming matches
   Frontend → GET /api/matches?isFinished=false
   Backend → Query Matches where IsFinished = false, order by KickoffTime
   Backend → Return List<Match>
   Frontend → Display in match list

2. User submits prediction
   Frontend → POST /api/predictions { matchId: 123, homeScore: 2, awayScore: 1 }
   Backend → Validate user authenticated
   Backend → Validate match not started (KickoffTime > now)
   Backend → Check prediction doesn't already exist
   Backend → Create Prediction (Status: PENDING, PointsEarned: 0)
   Backend → Save to database
   Backend → Return Prediction
   Frontend → Show success message

3. Match finishes (external system updates result)
   Background Job → Runs every 30 minutes
   Background Job → Finds matches where IsFinished = true AND has predictions with Status = PENDING
   Background Job → For each prediction:
      - Call ScoringService.CalculatePoints(pred.HomeScore, pred.AwayScore, match.HomeScore, match.AwayScore, match.Stage.Multiplier)
      - Update Prediction.PointsEarned = points
      - Update Prediction.Status = points > 0 ? CORRECT : INCORRECT
   Background Job → Save all predictions
   Background Job → For each affected user:
      - Update UserCompetitionStats (TotalPoints, TotalPredictions, CorrectPredictions, Accuracy)
      - Recalculate Rank
   Background Job → Notify via SignalR: hubContext.Clients.All.SendAsync("MatchFinished", match)

4. User views leaderboard
   Frontend → GET /api/leaderboard/competition/PL
   Backend → Query UserCompetitionStats where CompetitionCode = 'PL', order by Rank
   Backend → Join with Users to get usernames
   Backend → Return List<LeaderboardEntry>
   Frontend → Display leaderboard table
```

### Real-Time Update Flow (SignalR)

```
1. User opens match list page
   Frontend → SignalRService.startConnection()
   Frontend → SignalRService.joinMatchGroup(matchId) for each visible match

2. Match score updates (from admin or external API sync)
   Backend → MatchService.UpdateMatchResult(matchId, homeScore, awayScore)
   Backend → Update Match in database
   Backend → hubContext.Clients.Group($"match-{matchId}").SendAsync("LiveScore", { matchId, homeScore, awayScore })

3. Frontend receives update
   Frontend → SignalRService.liveScore$.subscribe(data => {
       // Update match card in UI with new score
       // Show live indicator (pulsing red dot)
   })

4. Match finishes
   Backend → ResultProcessingJob processes predictions
   Backend → hubContext.Clients.Group($"match-{matchId}").SendAsync("MatchFinished", match)

5. Frontend receives match finished event
   Frontend → SignalRService.matchFinished$.subscribe(match => {
       // Remove from upcoming list
       // Add to finished list
       // Show user's points earned notification
   })
```

---

## 🧪 TESTING ARCHITECTURE

### Test Pyramid

```
           ┌──────────────┐
          │   E2E Tests   │  (10% - Critical user journeys)
         └────────────────┘
       ┌──────────────────────┐
      │  Integration Tests    │  (20% - API + Database)
     └────────────────────────┘
   ┌──────────────────────────────┐
  │       Unit Tests              │  (70% - Services, Components)
 └────────────────────────────────┘
```

### Backend Testing

```csharp
// tests/FootballPrediction.Application.Tests/ScoringServiceTests.cs

public class ScoringServiceTests
{
    [Theory]
    [InlineData(2, 1, 2, 1, 1.0, 5)]    // Exact score
    [InlineData(3, 1, 2, 0, 1.0, 4)]    // Correct winner + goal diff
    [InlineData(2, 1, 3, 0, 1.0, 3)]    // Correct winner only
    [InlineData(2, 1, 1, 1, 1.0, 1)]    // One team correct score
    [InlineData(1, 2, 2, 1, 1.0, 0)]    // Wrong
    [InlineData(2, 1, 2, 1, 5.0, 25)]   // Exact score in FINAL (5x multiplier)
    public void CalculatePoints_ShouldReturnCorrectPoints(
        int predHome, int predAway,
        int actualHome, int actualAway,
        decimal multiplier,
        int expectedPoints)
    {
        // Arrange
        var service = new ScoringService();

        // Act
        var points = service.CalculatePoints(predHome, predAway, actualHome, actualAway, multiplier);

        // Assert
        Assert.Equal(expectedPoints, points);
    }
}

// tests/FootballPrediction.Api.Tests/PredictionsControllerTests.cs

public class PredictionsControllerTests
{
    private readonly Mock<IPredictionService> _mockService;
    private readonly PredictionsController _controller;

    [Fact]
    public async Task SubmitPrediction_ValidRequest_ReturnsCreatedResult()
    {
        // Arrange
        var request = new PredictionRequest { MatchId = 1, HomeScore = 2, AwayScore = 1 };
        _mockService.Setup(s => s.SubmitPrediction(It.IsAny<int>(), 1, 2, 1))
                   .ReturnsAsync(new Prediction { /* ... */ });

        // Act
        var result = await _controller.SubmitPrediction(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(201, createdResult.StatusCode);
    }
}
```

### Frontend Testing

```typescript
// src/app/features/predictions/prediction-form/prediction-form.component.spec.ts

describe('PredictionFormComponent', () => {
  let component: PredictionFormComponent;
  let fixture: ComponentFixture<PredictionFormComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['submitPrediction']);

    TestBed.configureTestingModule({
      imports: [PredictionFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    });

    fixture = TestBed.createComponent(PredictionFormComponent);
    component = fixture.componentInstance;
  });

  it('should submit prediction with valid scores', () => {
    // Arrange
    component.match = { id: 1, homeTeam: 'Arsenal', awayTeam: 'Chelsea', /* ... */ };
    component.predictionForm.setValue({ homeScore: 2, awayScore: 1 });
    mockApiService.submitPrediction.and.returnValue(of({ /* prediction */ }));

    // Act
    component.submitPrediction();

    // Assert
    expect(mockApiService.submitPrediction).toHaveBeenCalledWith(1, 2, 1);
  });

  it('should show validation error for negative scores', () => {
    // Arrange
    component.predictionForm.setValue({ homeScore: -1, awayScore: 2 });

    // Act
    component.submitPrediction();

    // Assert
    expect(component.predictionForm.valid).toBeFalse();
    expect(component.predictionForm.get('homeScore')?.errors).toBeTruthy();
  });
});
```

### E2E Testing (Cypress)

```typescript
// cypress/e2e/prediction-flow.cy.ts

describe('Prediction Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-cy=username]').type('testuser');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=login-btn]').click();
    cy.url().should('include', '/matches');
  });

  it('should allow user to submit a prediction', () => {
    // Click on first upcoming match
    cy.get('[data-cy=match-card]').first().click();

    // Fill in prediction form
    cy.get('[data-cy=home-score]').type('2');
    cy.get('[data-cy=away-score]').type('1');
    cy.get('[data-cy=submit-prediction]').click();

    // Verify success message
    cy.get('[data-cy=success-message]').should('contain', 'Prediction submitted');

    // Navigate to predictions page
    cy.get('[data-cy=nav-predictions]').click();

    // Verify prediction appears in list
    cy.get('[data-cy=prediction-card]').first().should('contain', '2 - 1');
  });
});
```

---

## 🎯 KEY DESIGN DECISIONS

### 1. Clean Architecture
**Decision**: Use Clean Architecture (Domain, Application, Infrastructure, API)
**Rationale**:
- Separation of concerns
- Testability (domain and application have no external dependencies)
- Maintainability (easy to change database or external APIs without affecting business logic)
- Scalability (can add new features without modifying core)

### 2. Angular 19 Standalone Components
**Decision**: Use standalone components (not NgModules)
**Rationale**:
- Modern Angular approach (as of v14+)
- Simpler setup (no module files)
- Better tree-shaking (smaller bundle size)
- Easier lazy loading

### 3. PostgreSQL over SQL Server
**Decision**: Use PostgreSQL instead of SQL Server
**Rationale**:
- Free on Render (SQL Server requires paid hosting)
- Open source
- Excellent performance
- Well-supported by EF Core

### 4. JWT Authentication
**Decision**: JWT tokens with refresh token rotation
**Rationale**:
- Stateless (no server-side session storage)
- Scalable (no session affinity needed)
- Works well with SPAs and PWAs
- Refresh tokens allow long-lived sessions while maintaining security

### 5. Repository Pattern
**Decision**: Use repository pattern over direct DbContext access in controllers
**Rationale**:
- Abstraction over data access
- Easier to mock for unit testing
- Can swap data source without changing business logic
- Consistent data access patterns

### 6. Background Jobs with Hangfire
**Decision**: Use Hangfire for scheduled jobs (not Windows Task Scheduler or cron)
**Rationale**:
- Cross-platform (works on Windows, Linux, Mac)
- Persistent storage (uses PostgreSQL - survives app restarts)
- Dashboard for monitoring
- Retry logic built-in

### 7. SignalR for Real-Time
**Decision**: Use SignalR for live score updates (not polling)
**Rationale**:
- Efficient (WebSockets, server push)
- Built-in to ASP.NET Core
- Client libraries for Angular
- Automatic fallback to long-polling

### 8. Tailwind CSS
**Decision**: Use Tailwind CSS for styling (not Bootstrap)
**Rationale**:
- Utility-first (faster development)
- Smaller bundle size (purges unused classes)
- Modern design system
- Easy to customize

### 9. PWA with Service Workers
**Decision**: Implement as PWA with offline support
**Rationale**:
- Works on all devices (iOS, Android, desktop)
- No app store submission needed
- Offline functionality
- Install to home screen
- Push notifications (future enhancement)

### 10. Free-Tier Deployment
**Decision**: Deploy on Vercel + Render (both free tiers)
**Rationale**:
- $0/month cost
- Production-ready
- Automatic HTTPS
- CI/CD built-in
- Good performance
- Easy to upgrade if needed

---

**Version**: 2.0
**Created**: 2026-03-05
**Last Updated**: 2026-03-05
**Purpose**: Comprehensive architectural reference
**Target**: All agents and developers working on the project
