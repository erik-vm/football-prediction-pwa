# Tech Stack - Exact Versions

**STATUS: LOCKED - Do not upgrade without Architect Agent approval**
These versions are production-validated across 2 development cycles.

## Backend

| Technology | Version | Notes |
|------------|---------|-------|
| .NET SDK | 9.0.x | Do NOT use .NET 10 |
| ASP.NET Core | 9.0 | Web API with controllers |
| Entity Framework Core | 9.0.x | All EF packages must be 9.x |
| Npgsql.EntityFrameworkCore.PostgreSQL | 9.0.2 | PostgreSQL provider |
| Microsoft.EntityFrameworkCore.Tools | 9.0.0 | Migration tools |
| BCrypt.Net-Next | 4.0.3 | Password hashing (cost factor 12) |
| FluentValidation | 11.3.0 | Request validation |
| Swashbuckle.AspNetCore | 7.2.0 | Swagger/OpenAPI |
| xUnit | 2.9.0 | Unit testing |
| Moq | 4.20.0 | Mocking |
| FluentAssertions | 7.0.0 | Test assertions |

## Frontend

| Technology | Version | Notes |
|------------|---------|-------|
| Angular | 19.x | Standalone components, signals |
| TypeScript | 5.7+ | Strict mode |
| Tailwind CSS | 3.4.17 | **NOT v4** - v4 is incompatible with Angular 19 |
| RxJS | 7.8.0 | Reactive programming |
| PostCSS | 8.x | Required by Tailwind |
| Autoprefixer | 10.x | CSS vendor prefixes |

## Database

| Technology | Version | Notes |
|------------|---------|-------|
| PostgreSQL | 16+ | Via Docker locally, Render in production |
| Docker | Latest | For local PostgreSQL |

## Deployment

| Service | Purpose | Tier |
|---------|---------|------|
| Vercel | Frontend hosting | Free |
| Render | Backend + PostgreSQL | Free |

## External APIs

| API | Version | Purpose |
|-----|---------|---------|
| football-data.org | v4 | Match data, scores, competitions |

## Critical Version Rules

1. **All EF Core packages must use same major.minor version** (9.0.x)
2. **dotnet-ef tool must match**: `dotnet tool install --global dotnet-ef --version 9.0.0`
3. **Tailwind v4 is INCOMPATIBLE** with Angular 19 - use 3.4.17
4. **Node.js 20+** required for Vercel deployment
5. **Do not mix .NET 9 and .NET 10 packages** - causes runtime errors

## Project Structure

```
football-prediction-pwa/
  backend/
    FootballPrediction.sln
    docker-compose.yml
    src/
      FootballPrediction.Domain/          # Entities, no dependencies
      FootballPrediction.Application/     # Interfaces, DTOs, services
      FootballPrediction.Infrastructure/  # EF, repositories, external services
      FootballPrediction.Api/             # Controllers, middleware, startup
    tests/
      FootballPrediction.Tests/           # Unit + integration tests
  frontend/
    src/
      app/
        core/          # Services, guards, interceptors
        features/      # Feature modules (auth, matches, predictions, leaderboard)
        shared/        # Shared components, models, pipes
      environments/    # Environment configs
```
