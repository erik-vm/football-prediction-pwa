# Architecture

## Clean Architecture (4 Layers)

```
FootballPrediction.Domain        → Entities only, zero dependencies
FootballPrediction.Application   → Interfaces, DTOs, service contracts, validators
FootballPrediction.Infrastructure→ EF Core, repositories, external API clients
FootballPrediction.Api           → Controllers, middleware, background jobs, Program.cs
```

**Dependency direction**: Api → Infrastructure → Application → Domain

## Backend Patterns

| Pattern | Usage |
|---------|-------|
| Repository | Data access abstraction (one per aggregate root) |
| Service Layer | Business logic (ScoringService, LeaderboardService, etc.) |
| Background Service | IHostedService for periodic tasks |
| JWT Bearer Auth | Stateless authentication with refresh tokens |
| Request Validation | FluentValidation for input DTOs |
| CQRS-lite | Separate read/write models where beneficial |

## Database

- **PostgreSQL 16** via Docker (dev) / Render (prod)
- **EF Core 9** with code-first migrations
- **Auto-timestamping**: CreatedAt/UpdatedAt set in DbContext.SaveChangesAsync()
- **Unique constraints**: (UserId, MatchId) on Predictions, (Code, Season) on Tournaments

## Frontend Patterns

| Pattern | Usage |
|---------|-------|
| Standalone Components | No NgModules - Angular 19 default |
| Signals | Reactive state management (no NgRx needed) |
| Lazy Loading | Route-level code splitting |
| Feature Folders | auth/, matches/, predictions/, leaderboard/, preferences/ |
| Core Services | Singleton services in core/ (API, Auth, Storage) |
| Smart/Dumb Components | Container components handle data, child components display |

## Authentication Flow

```
Register/Login → Backend validates → Returns JWT (60min) + RefreshToken (7 days)
                                      ↓
Frontend stores in localStorage → Attaches Bearer token via interceptor
                                      ↓
On 401 → Try refresh token → If expired → Redirect to /login
```

## Data Sync Flow

```
football-data.org API → FootballDataSyncJob (60min) → Update match scores
                                                        ↓
                                              ScorePendingPredictions()
                                                        ↓
                                              Update leaderboard (computed on-demand)
```

## External API Integration

- **API**: football-data.org v4
- **Auth**: X-Auth-Token header
- **Rate limit**: 6.5s delay between competition requests
- **Competitions**: PL, PD, BL1, SA, FL1, CL, PPL, DED, ELC, BSA, WC, EC
- **Sync scope**: Current season matches with scores and status

## Deployment Architecture

```
[Vercel] ← Angular PWA (static files)
    ↓ API calls
[Render] ← ASP.NET Core API + PostgreSQL
    ↓ External API
[football-data.org]
```
