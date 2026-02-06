# Football Prediction PWA - Technology Stack Specification

## Document Purpose

This document defines the complete technology stack, dependencies, versions, and technical decisions for the Football Prediction PWA project.

---

## 1. Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│              Client Layer (PWA)                          │
│              Angular 19 + TypeScript 5.7                 │
│              Tailwind CSS + Angular Material             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API (JSON)
┌────────────────────┴────────────────────────────────────┐
│              Application Layer                           │
│              ASP.NET Core 9 Web API                      │
│              Entity Framework Core 9                     │
│              JWT Authentication                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Data Layer                                  │
│              PostgreSQL 16+                              │
│              EF Core Migrations                          │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Stack

### 2.1 Core Framework

**Angular 19** (Latest LTS)
- **Why**:
  - Enterprise-grade framework with excellent TypeScript support
  - Strong dependency injection and modularity
  - Built-in PWA support with service workers
  - Reactive forms and RxJS integration
  - Powerful CLI for scaffolding and builds
  - Signals for reactive state management

**TypeScript 5.7+**
- **Why**:
  - Type safety reduces runtime errors
  - Better IDE support and refactoring
  - Modern ECMAScript features
  - Compile-time validation

### 2.2 UI Framework

**Choice: Tailwind CSS + Angular Material**

**Tailwind CSS 4.x**
- Utility-first CSS framework
- Highly customizable
- Small production bundle size
- Mobile-first responsive design
- Dark mode support ready

**Angular Material 19** (Optional for complex components)
- Pre-built UI components (dialogs, tables, menus)
- Accessibility built-in (WCAG compliant)
- Consistent design system
- Use sparingly, prefer Tailwind for custom design

**Alternative**: Bootstrap 5 (if team prefers)

### 2.3 State Management

**Angular Signals** (Built-in from Angular 16+)
- **Why**:
  - Native Angular solution
  - Simplified reactivity
  - Better performance than traditional observables
  - Type-safe
  - No external dependencies

**RxJS 7.x** (for async operations)
- HTTP requests
- WebSocket connections (future)
- Complex event handling

### 2.4 HTTP & API Integration

**Angular HttpClient**
- Built-in HTTP client
- Interceptors for auth token injection
- Error handling interceptors
- Response transformation

**Configuration:**
```typescript
// HTTP Interceptors
- AuthInterceptor: Add JWT token to requests
- ErrorInterceptor: Handle 401, 500 errors globally
- LoadingInterceptor: Show global loading state
- LoggingInterceptor: Log API calls (dev only)
```

### 2.5 Routing & Navigation

**Angular Router**
- Lazy loading modules
- Route guards:
  - `AuthGuard` - Require authentication
  - `AdminGuard` - Require admin role
  - `UnsavedChangesGuard` - Prevent navigation with unsaved data
- Preloading strategies for performance

### 2.6 Forms

**Angular Reactive Forms**
- Type-safe form controls
- Custom validators
- Async validators (username uniqueness)
- Form state management

### 2.7 PWA Support

**@angular/pwa**
- Service worker for offline caching
- App manifest for install prompt
- Push notification infrastructure (future)
- Background sync for offline submissions

**Workbox** (via Angular PWA)
- Cache strategies:
  - `CacheFirst`: Static assets (images, fonts)
  - `NetworkFirst`: API calls with fallback
  - `StaleWhileRevalidate`: Leaderboard data

### 2.8 Additional Frontend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `date-fns` | 4.x | Date manipulation and formatting |
| `chart.js` | 4.x | Statistics charts (future) |
| `ng-charts` | 6.x | Angular wrapper for Chart.js |
| `@ngrx/signals` | 19.x | Advanced state management (if needed) |
| `ngx-cookie-service` | 19.x | Cookie management |

### 2.9 Development Tools

| Tool | Purpose |
|------|---------|
| `ESLint` | Code linting |
| `Prettier` | Code formatting |
| `Husky` | Git hooks |
| `lint-staged` | Pre-commit linting |
| `Cypress` | E2E testing |
| `Jasmine/Karma` | Unit testing |
| `Angular DevTools` | Browser debugging |

---

## 3. Backend Stack

### 3.1 Core Framework

**ASP.NET Core 9** (LTS)
- **Why**:
  - High performance (Kestrel web server)
  - Cross-platform (Windows, Linux, macOS)
  - Built-in dependency injection
  - Middleware pipeline for request processing
  - Excellent tooling (Visual Studio, Rider)
  - Strong typing with C# 13

**C# 13**
- Record types for DTOs
- Pattern matching
- Nullable reference types
- Top-level statements
- File-scoped namespaces

### 3.2 API Framework

**ASP.NET Core Web API**
- RESTful API design
- Built-in model validation
- Content negotiation (JSON)
- API versioning support
- OpenAPI/Swagger documentation

### 3.3 Authentication & Authorization

**ASP.NET Core Identity**
- User management
- Password hashing (bcrypt)
- Role-based authorization
- Claims-based authorization

**JWT Authentication**
```csharp
// Libraries
Microsoft.AspNetCore.Authentication.JwtBearer 9.0

// Configuration
- Algorithm: RS256 (asymmetric)
- Access Token: 15 minutes
- Refresh Token: 7 days with rotation
- Issuer/Audience validation
- Token stored in HttpOnly cookies
```

### 3.4 Database Access

**Entity Framework Core 9**
- Code-first approach
- LINQ queries
- Change tracking
- Migration management
- Interceptors for audit logging

**PostgreSQL Provider**
```
Npgsql.EntityFrameworkCore.PostgreSQL 9.0
```

**Database Features:**
- PostgreSQL 16+
- JSON columns for flexibility
- Full-text search (future)
- Indexes for performance
- Foreign key constraints

### 3.5 Validation

**FluentValidation 11.x**
- **Why**:
  - Separation of validation logic
  - Reusable validators
  - Complex validation rules
  - Better error messages
  - Async validation support

**Example:**
```csharp
public class CreatePredictionValidator : AbstractValidator<CreatePredictionDto>
{
    public CreatePredictionValidator()
    {
        RuleFor(x => x.HomeScore).InclusiveBetween(0, 9);
        RuleFor(x => x.AwayScore).InclusiveBetween(0, 9);
        RuleFor(x => x.MatchId).NotEmpty();
    }
}
```

### 3.6 Logging

**Serilog 4.x**
- Structured logging
- JSON output format
- Multiple sinks:
  - Console (development)
  - File (production)
  - Azure App Insights (future)

**Configuration:**
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithCorrelationId()
    .WriteTo.Console()
    .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
```

### 3.7 Object Mapping

**AutoMapper 13.x**
- Map entities to DTOs
- Reduce boilerplate code
- Type-safe mapping
- Profile-based configuration

### 3.8 API Documentation

**Swashbuckle.AspNetCore 7.x**
- OpenAPI/Swagger specification
- Interactive API documentation
- Code generation for clients
- JWT authentication support in UI

### 3.9 Additional Backend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `RestSharp` | 112.x | HTTP client for external APIs (football-data.org) |
| `Hangfire` | 1.8.x | Background jobs (weekly bonuses, email) |
| `FluentEmail` | 3.x | Email sending (future) |
| `BCrypt.Net-Next` | 4.x | Password hashing |
| `CorrelationId` | 3.x | Request correlation tracking |

### 3.10 Testing Libraries

| Library | Purpose |
|---------|---------|
| `xUnit` | Unit testing framework |
| `FluentAssertions` | Readable assertions |
| `Moq` | Mocking framework |
| `AutoFixture` | Test data generation |
| `Testcontainers` | Integration testing with PostgreSQL |
| `WebApplicationFactory` | Integration testing |

---

## 4. Database

### 4.1 PostgreSQL 16+

**Why PostgreSQL:**
- Robust relational database
- ACID compliance
- Excellent performance
- JSON/JSONB support
- Full-text search
- Window functions for leaderboards
- Free and open-source

**Features Used:**
- Indexes (B-tree, partial)
- Foreign key constraints
- Triggers (audit logging)
- Views (leaderboard calculations)
- Materialized views (performance)

### 4.2 Migration Strategy

**Entity Framework Core Migrations**
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigration
```

**Migration Naming Convention:**
- Format: `V{number}__{Description}.cs`
- Examples:
  - `V001__InitialCreate.cs`
  - `V002__AddWeeklyBonuses.cs`
  - `V003__AddSeasonPredictions.cs`

---

## 5. Hosting & Infrastructure

### 5.1 Backend Hosting

**Option 1: Azure App Service (Recommended)**
- Managed PaaS
- Auto-scaling
- CI/CD integration
- SSL certificates included
- Staging slots

**Option 2: Railway.app**
- Simple deployment
- PostgreSQL included
- Low cost
- Good for MVP

**Option 3: DigitalOcean App Platform**
- Middle ground between Azure and Railway
- Managed services
- Reasonable pricing

### 5.2 Frontend Hosting

**Option 1: Vercel (Recommended)**
- Optimized for Angular/SPA
- Global CDN
- Automatic HTTPS
- Preview deployments
- Free tier generous

**Option 2: Netlify**
- Similar to Vercel
- Good Angular support
- Edge functions available

**Option 3: Azure Static Web Apps**
- Tight integration with Azure backend
- Free tier
- API integration

### 5.3 Database Hosting

**Option 1: Azure Database for PostgreSQL**
- Managed service
- Automatic backups
- High availability
- Monitoring included

**Option 2: Supabase**
- PostgreSQL with extras (auth, realtime)
- Free tier available
- Good for MVP

**Option 3: Railway PostgreSQL**
- Bundled with backend hosting
- Simple setup
- Low cost

---

## 6. DevOps & CI/CD

### 6.1 Version Control

**Git + GitHub**
- Feature branch workflow
- Pull request reviews
- Branch protection rules

**Branch Strategy:**
```
main          (production)
develop       (integration)
feature/*     (new features)
fix/*         (bug fixes)
release/*     (release preparation)
```

### 6.2 CI/CD Pipeline

**GitHub Actions**

**Backend Pipeline:**
```yaml
- Checkout code
- Setup .NET 9
- Restore dependencies
- Build solution
- Run unit tests
- Run integration tests
- Publish artifacts
- Deploy to Azure/Railway
```

**Frontend Pipeline:**
```yaml
- Checkout code
- Setup Node.js 22
- Install dependencies
- Lint (ESLint)
- Run unit tests
- Build production bundle
- Deploy to Vercel
```

### 6.3 Environment Configuration

**Environments:**
- `Development` - Local development
- `Staging` - Pre-production testing
- `Production` - Live environment

**Configuration Management:**
```
appsettings.json          (base config)
appsettings.Development.json
appsettings.Staging.json
appsettings.Production.json
```

**Secrets Management:**
- Azure Key Vault (production)
- User Secrets (development)
- Environment variables (all)

---

## 7. Security Stack

### 7.1 Authentication Security

**JWT Configuration:**
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero
        };
    });
```

### 7.2 Password Security

**BCrypt Configuration:**
- Work factor: 12
- Salt rounds: Automatic
- No password max length (allow up to 64 chars)

### 7.3 HTTPS & Certificates

**Development:**
- `dotnet dev-certs https --trust`

**Production:**
- Let's Encrypt (automatic with hosting providers)
- Azure managed certificates

### 7.4 Security Headers

**ASP.NET Core Middleware:**
```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Add("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    await next();
});
```

### 7.5 CORS Configuration

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins(
            "http://localhost:4200",  // Angular dev
            "https://football-prediction.app" // Production
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## 8. Monitoring & Observability

### 8.1 Application Monitoring

**Azure Application Insights**
- Request tracking
- Dependency tracking
- Exception tracking
- Custom metrics
- Performance monitoring

**Alternative: Sentry**
- Error tracking
- Performance monitoring
- Release tracking

### 8.2 Logging

**Structured Logging with Serilog:**
```csharp
_logger.LogInformation(
    "User {UserId} submitted prediction {PredictionId} for match {MatchId}",
    userId, predictionId, matchId
);
```

**Log Levels:**
- `Trace` - Very detailed (dev only)
- `Debug` - Debugging information (dev only)
- `Information` - General flow
- `Warning` - Unexpected behavior
- `Error` - Errors and exceptions
- `Critical` - Critical failures

### 8.3 Health Checks

**ASP.NET Core Health Checks:**
```csharp
services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddCheck<ExternalApiHealthCheck>("football-api");
```

**Endpoints:**
- `/health` - Overall health
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

---

## 9. Testing Stack

### 9.1 Frontend Testing

**Unit Tests:**
- Framework: Jasmine + Karma
- Coverage target: > 70%
- Mock services with `jasmine.createSpy()`

**E2E Tests:**
- Framework: Cypress 13.x
- Test user journeys
- Visual regression (future)

### 9.2 Backend Testing

**Unit Tests:**
- Framework: xUnit
- Coverage target: > 80%
- Mocking: Moq
- Assertions: FluentAssertions

**Integration Tests:**
- WebApplicationFactory
- Testcontainers for PostgreSQL
- Test database seeding

**Example:**
```csharp
public class ScoringServiceTests
{
    [Theory]
    [InlineData(2, 1, 2, 1, 5)] // Exact score
    [InlineData(1, 0, 2, 1, 4)] // Winner + diff
    [InlineData(2, 0, 3, 1, 3)] // Winner only
    public void CalculatePoints_ShouldReturnCorrectPoints(
        int predHome, int predAway, int actHome, int actAway, int expected)
    {
        var result = _service.CalculatePoints(predHome, predAway, actHome, actAway);
        result.Should().Be(expected);
    }
}
```

---

## 10. Performance Optimization

### 10.1 Backend Optimizations

- **Database Indexing**: All foreign keys, commonly queried columns
- **Caching**: Redis for leaderboard (future)
- **Query Optimization**: Eager loading with `.Include()`
- **Response Compression**: Gzip/Brotli
- **Pagination**: All list endpoints

### 10.2 Frontend Optimizations

- **Lazy Loading**: Feature modules
- **AOT Compilation**: Production builds
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Vendor chunks
- **Service Worker Caching**: Static assets
- **OnPush Change Detection**: Components

### 10.3 PWA Optimizations

- **App Shell Pattern**: Fast initial load
- **Precaching**: Critical assets
- **Runtime Caching**: API responses
- **Background Sync**: Offline submissions

---

## 11. Development Environment

### 11.1 Required Software

**Backend Development:**
- .NET 9 SDK
- Visual Studio 2022 / Rider 2024 / VS Code
- PostgreSQL 16+ (or Docker)
- Postman / Insomnia (API testing)

**Frontend Development:**
- Node.js 22 LTS
- npm 10+ or pnpm 9+
- VS Code with Angular extensions
- Angular CLI 19

**Database Tools:**
- pgAdmin 4
- Azure Data Studio
- DBeaver

### 11.2 VS Code Extensions (Frontend)

- Angular Language Service
- ESLint
- Prettier
- Angular Snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Path Intellisense

### 11.3 VS Code Extensions (Backend)

- C# Dev Kit
- .NET Core Test Explorer
- REST Client
- GitLens
- Error Lens

---

## 12. Package Versions Summary

### 12.1 Frontend (package.json)

```json
{
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/platform-browser-dynamic": "^19.0.0",
    "@angular/router": "^19.0.0",
    "@angular/service-worker": "^19.0.0",
    "@angular/material": "^19.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.8.0",
    "zone.js": "~0.15.0",
    "date-fns": "^4.1.0",
    "ngx-cookie-service": "^19.0.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "typescript": "~5.7.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "cypress": "^13.0.0"
  }
}
```

### 12.2 Backend (.csproj)

```xml
<ItemGroup>
  <!-- Core Framework -->
  <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.0" />

  <!-- Database -->
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.0" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.0" />

  <!-- Authentication -->
  <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
  <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />

  <!-- Validation -->
  <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />

  <!-- Logging -->
  <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
  <PackageReference Include="Serilog.Sinks.File" Version="6.0.0" />

  <!-- Utilities -->
  <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="13.0.0" />
  <PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />

  <!-- Testing -->
  <PackageReference Include="xunit" Version="2.9.0" />
  <PackageReference Include="Moq" Version="4.20.0" />
  <PackageReference Include="FluentAssertions" Version="7.0.0" />
  <PackageReference Include="Testcontainers.PostgreSql" Version="3.10.0" />
</ItemGroup>
```

---

## 13. Architecture Decisions

### 13.1 Why .NET instead of Spring Boot?

- **Performance**: .NET 9 is faster (Kestrel benchmarks)
- **Async-first**: Better async/await support
- **Tooling**: Excellent Visual Studio/Rider support
- **Type Safety**: C# nullable reference types
- **Modern Features**: Record types, pattern matching
- **Cross-platform**: Linux/Windows/macOS

### 13.2 Why Angular instead of React?

- **Structure**: Opinionated structure scales better
- **TypeScript**: First-class TypeScript support
- **DI**: Built-in dependency injection
- **Tooling**: Angular CLI for scaffolding
- **PWA**: Excellent PWA support out-of-box
- **RxJS**: Reactive programming built-in

### 13.3 Why PostgreSQL instead of SQL Server?

- **Open Source**: No licensing costs
- **JSON Support**: Better JSON column types
- **Performance**: Excellent query performance
- **Cross-platform**: Runs anywhere
- **Azure Support**: Azure Database for PostgreSQL available

---

**Version**: 1.0
**Created**: 2025-01-27
**Status**: Final Specification
**Next**: Begin project scaffolding
