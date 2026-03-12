# Phase 1: Backend Foundation

**Estimated Time**: 2-3 hours
**Complexity**: Medium
**Prerequisites**: Phase 0 complete, dotnet-ef v9.0.0, Docker Desktop

---

## 🎯 OBJECTIVE

Create a .NET 9 Web API solution with Clean Architecture, Entity Framework Core, PostgreSQL database, and all domain entities. By the end of this phase, you'll have a fully functional backend with 5 database tables and a health check endpoint.

---

## 📋 DELIVERABLES

- [ ] .NET 9 solution with 6 projects (Clean Architecture)
- [ ] Entity Framework Core 9 configured
- [ ] PostgreSQL 16 running in Docker
- [ ] 5 domain entities created (User, Tournament, GameWeek, Match, Prediction)
- [ ] Entity configurations with indexes and relationships
- [ ] Database migrations created
- [ ] 5 tables created in PostgreSQL
- [ ] Health check endpoint functional (`/health`)
- [ ] Solution builds with 0 warnings, 0 errors
- [ ] All changes committed to git

---

## 🤖 AGENT DELEGATION

**Delegate to**: BACKEND-AGENT

**Instructions**:
```markdown
You are the BACKEND-AGENT. Your task is to create the .NET 9 backend foundation.

**Read**:
- agents/BACKEND-AGENT.md (your role guide)
- error-prevention/PHASE-01-PREVENTION.md (critical errors to avoid)
- TECH-STACK.md (exact package versions)

**Implement**:
- Clean Architecture with 6 projects
- Entity Framework Core 9
- PostgreSQL with Docker
- Domain entities and configurations
- Database migrations using SQL script method

**Avoid**:
- ❌ dotnet-ef v10 (use v9.0.0 exactly)
- ❌ Package version mismatches
- ❌ 'dotnet ef database update' command (use SQL script method)
- ❌ PostgreSQL port conflicts

**Report back** when complete with:
- Solution structure created
- Database tables created (5 tables)
- Build status (must be 0 warnings, 0 errors)
- Any blockers encountered
```

---

## 📝 DETAILED IMPLEMENTATION STEPS

### Step 1: Verify Prerequisites (10 minutes)

```bash
# 1. Check .NET SDK version
dotnet --version
# Should be: 9.x or 10.x (SDK can be 10.x)

# 2. Check dotnet-ef version (CRITICAL!)
dotnet ef --version
# Must be: 9.0.0 (NOT 10.x!)

# If wrong version:
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0

# 3. Check Docker Desktop running
docker ps
# Should list containers (or be empty but not error)

# If not running: Start Docker Desktop manually

# 4. Check for PostgreSQL port conflicts
netstat -ano | findstr :5432
# Should be empty

# If port 5432 in use by Windows PostgreSQL:
net stop postgresql-x64-16
```

**Validation**: All prerequisites met

---

### Step 2: Create Solution Structure (15 minutes)

```bash
# Navigate to project root
cd football-prediction-pwa-new

# Create backend folder
mkdir backend
cd backend

# Create solution
dotnet new sln -n FootballPrediction

# Create source projects folder
mkdir src

# Create Domain project (entities, interfaces)
dotnet new classlib -n FootballPrediction.Domain -o src/FootballPrediction.Domain -f net9.0
dotnet sln add src/FootballPrediction.Domain/FootballPrediction.Domain.csproj

# Create Application project (business logic, DTOs)
dotnet new classlib -n FootballPrediction.Application -o src/FootballPrediction.Application -f net9.0
dotnet sln add src/FootballPrediction.Application/FootballPrediction.Application.csproj

# Add reference: Application -> Domain
cd src/FootballPrediction.Application
dotnet add reference ../FootballPrediction.Domain/FootballPrediction.Domain.csproj
cd ../..

# Create Infrastructure project (data access, EF Core)
dotnet new classlib -n FootballPrediction.Infrastructure -o src/FootballPrediction.Infrastructure -f net9.0
dotnet sln add src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj

# Add references: Infrastructure -> Domain, Application
cd src/FootballPrediction.Infrastructure
dotnet add reference ../FootballPrediction.Domain/FootballPrediction.Domain.csproj
dotnet add reference ../FootballPrediction.Application/FootballPrediction.Application.csproj
cd ../..

# Create API project (controllers, startup)
dotnet new webapi -n FootballPrediction.Api -o src/FootballPrediction.Api -f net9.0
dotnet sln add src/FootballPrediction.Api/FootballPrediction.Api.csproj

# Add references: Api -> All layers
cd src/FootballPrediction.Api
dotnet add reference ../FootballPrediction.Domain/FootballPrediction.Domain.csproj
dotnet add reference ../FootballPrediction.Application/FootballPrediction.Application.csproj
dotnet add reference ../FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj
cd ../..

# Create tests folder
mkdir tests

# Create unit tests project
dotnet new xunit -n FootballPrediction.UnitTests -o tests/FootballPrediction.UnitTests -f net9.0
dotnet sln add tests/FootballPrediction.UnitTests/FootballPrediction.UnitTests.csproj

# Add references: UnitTests -> All source projects
cd tests/FootballPrediction.UnitTests
dotnet add reference ../../src/FootballPrediction.Domain/FootballPrediction.Domain.csproj
dotnet add reference ../../src/FootballPrediction.Application/FootballPrediction.Application.csproj
dotnet add reference ../../src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj
cd ../..

# Create integration tests project
dotnet new xunit -n FootballPrediction.IntegrationTests -o tests/FootballPrediction.IntegrationTests -f net9.0
dotnet sln add tests/FootballPrediction.IntegrationTests/FootballPrediction.IntegrationTests.csproj

# Add references: IntegrationTests -> All source projects
cd tests/FootballPrediction.IntegrationTests
dotnet add reference ../../src/FootballPrediction.Domain/FootballPrediction.Domain.csproj
dotnet add reference ../../src/FootballPrediction.Application/FootballPrediction.Application.csproj
dotnet add reference ../../src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj
dotnet add reference ../../src/FootballPrediction.Api/FootballPrediction.Api.csproj
cd ../..

# Verify solution structure
dotnet build
# Should succeed with 0 errors, 0 warnings
```

**Validation**: 6 projects created, solution builds successfully

---

### Step 3: Add NuGet Packages (10 minutes)

```bash
# Add EF Core packages to Infrastructure project
cd src/FootballPrediction.Infrastructure

# PostgreSQL provider (version 9.0.2 for .NET 9)
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.2

# EF Core tools
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0

cd ../..

# Add testing packages
cd tests/FootballPrediction.UnitTests

dotnet add package Moq --version 4.20.70
dotnet add package FluentAssertions --version 7.0.0

cd ../..

# Verify packages installed
dotnet restore
dotnet build
# Should succeed
```

**Validation**: All packages installed, solution builds

---

### Step 4: Create Domain Entities (20 minutes)

Create these entities in `src/FootballPrediction.Domain/Entities/`:

**User.cs**:
```csharp
namespace FootballPrediction.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
```

**Tournament.cs**:
```csharp
namespace FootballPrediction.Domain.Entities;

public class Tournament
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // e.g., "PL", "CL"
    public string Season { get; set; } = string.Empty; // e.g., "2024/2025"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Country { get; set; }
    public string? Type { get; set; } // e.g., "LEAGUE", "CUP"
    public string? LogoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Match> Matches { get; set; } = new List<Match>();
    public ICollection<GameWeek> GameWeeks { get; set; } = new List<GameWeek>();
}
```

**GameWeek.cs**:
```csharp
namespace FootballPrediction.Domain.Entities;

public class GameWeek
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Tournament Tournament { get; set; } = null!;
    public ICollection<Match> Matches { get; set; } = new List<Match>();
}
```

**Match.cs**:
```csharp
namespace FootballPrediction.Domain.Entities;

public class Match
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public Guid? GameWeekId { get; set; }
    public string HomeTeam { get; set; } = string.Empty;
    public string AwayTeam { get; set; } = string.Empty;
    public DateTime KickoffTime { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string Status { get; set; } = "SCHEDULED"; // SCHEDULED, IN_PLAY, PAUSED, FINISHED, etc.
    public string CompetitionCode { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public int? Matchday { get; set; }
    public bool IsFinished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Tournament Tournament { get; set; } = null!;
    public GameWeek? GameWeek { get; set; }
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
```

**Prediction.cs**:
```csharp
namespace FootballPrediction.Domain.Entities;

public class Prediction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MatchId { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public int? PointsEarned { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, SCORED
    public string CompetitionCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Match Match { get; set; } = null!;
}
```

**Validation**: All 5 entities created

---

### Step 5: Create Entity Configurations (25 minutes)

Create these in `src/FootballPrediction.Infrastructure/Data/Configurations/`:

**UserConfiguration.cs**:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.HasMany(u => u.Predictions)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

**TournamentConfiguration.cs**:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class TournamentConfiguration : IEntityTypeConfiguration<Tournament>
{
    public void Configure(EntityTypeBuilder<Tournament> builder)
    {
        builder.ToTable("Tournaments");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(10);

        builder.HasIndex(t => t.Code)
            .IsUnique();

        builder.HasMany(t => t.Matches)
            .WithOne(m => m.Tournament)
            .HasForeignKey(m => m.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.GameWeeks)
            .WithOne(g => g.Tournament)
            .HasForeignKey(g => g.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

**GameWeekConfiguration.cs**:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class GameWeekConfiguration : IEntityTypeConfiguration<GameWeek>
{
    public void Configure(EntityTypeBuilder<GameWeek> builder)
    {
        builder.ToTable("GameWeeks");

        builder.HasKey(g => g.Id);

        builder.HasIndex(g => new { g.TournamentId, g.WeekNumber })
            .IsUnique();

        builder.HasMany(g => g.Matches)
            .WithOne(m => m.GameWeek)
            .HasForeignKey(m => m.GameWeekId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
```

**MatchConfiguration.cs**:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("Matches");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.HomeTeam)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(m => m.AwayTeam)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(m => m.TournamentId);
        builder.HasIndex(m => m.GameWeekId);
        builder.HasIndex(m => m.IsFinished);

        builder.HasMany(m => m.Predictions)
            .WithOne(p => p.Match)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

**PredictionConfiguration.cs**:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Data.Configurations;

public class PredictionConfiguration : IEntityTypeConfiguration<Prediction>
{
    public void Configure(EntityTypeBuilder<Prediction> builder)
    {
        builder.ToTable("Predictions");

        builder.HasKey(p => p.Id);

        builder.HasIndex(p => new { p.UserId, p.MatchId })
            .IsUnique();

        builder.Property(p => p.Status)
            .IsRequired()
            .HasMaxLength(50);
    }
}
```

**Validation**: All 5 configurations created

---

### Step 6: Create DbContext (15 minutes)

Create `src/FootballPrediction.Infrastructure/Data/ApplicationDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data.Configurations;

namespace FootballPrediction.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<GameWeek> GameWeeks => Set<GameWeek>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<Prediction> Predictions => Set<Prediction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations automatically
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

**Validation**: DbContext created

---

### Step 7: Set Up Docker PostgreSQL (10 minutes)

Create `backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: football_prediction_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: football_prediction
    ports:
      - "5433:5432"  # Using 5433 to avoid conflicts
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Start PostgreSQL:
```bash
cd backend
docker-compose up -d

# Wait for health check
docker ps
# Should show "healthy" status after ~10 seconds

# Verify connection
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\l'
# Should list databases
```

**Validation**: PostgreSQL running and accessible

---

### Step 8: Configure Connection String (5 minutes)

Create/modify `src/FootballPrediction.Api/appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres"
  }
}
```

**Important**: Do NOT put connection string in `appsettings.json` (only in Development.json)

**Validation**: Connection string configured

---

### Step 9: Register DbContext in DI (10 minutes)

Modify `src/FootballPrediction.Api/Program.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using FootballPrediction.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"];

// Handle Render PostgreSQL URL format
if (connectionString != null && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    var uri = new Uri(connectionString);
    var host = uri.Host;
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    var userInfo = uri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
```

**Validation**: DbContext registered in DI

---

### Step 10: Create and Apply Migration (20 minutes) - CRITICAL

**Use SQL script method** (most reliable):

```bash
# Navigate to Infrastructure project
cd src/FootballPrediction.Infrastructure

# Create migration
dotnet ef migrations add InitialCreate --startup-project ../FootballPrediction.Api

# Generate SQL script (do NOT use 'database update')
dotnet ef migrations script --output migration.sql --startup-project ../FootballPrediction.Api

# Navigate back to backend root
cd ../..

# Apply SQL to PostgreSQL
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql

# Verify tables created
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'

# Should output:
#              List of relations
#  Schema |       Name        | Type  |  Owner
# --------+-------------------+-------+----------
#  public | GameWeeks         | table | postgres
#  public | Matches           | table | postgres
#  public | Predictions       | table | postgres
#  public | Tournaments       | table | postgres
#  public | Users             | table | postgres
#  public | __EFMigrationsHistory | table | postgres

# Verify Users table structure
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\d "Users"'
# Should show columns including RefreshToken, RefreshTokenExpiry
```

**Validation**: 5 tables created (+ EF migrations history)

---

### Step 11: Build and Run API (10 minutes)

```bash
# Navigate to API project
cd src/FootballPrediction.Api

# Build solution
dotnet build
# Should succeed with 0 warnings, 0 errors

# Run API
dotnet run

# Should output:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: http://localhost:5000
# info: Microsoft.Hosting.Lifetime[0]
#       Application started.

# In another terminal, test health endpoint
curl http://localhost:5000/health

# Should output:
# {"status":"healthy","timestamp":"2026-03-05T..."}

# Test Swagger UI (open in browser)
# http://localhost:5000/swagger

# Stop API (Ctrl+C)
```

**Validation**: API runs successfully, health check responds

---

### Step 12: Create Backend .gitignore (5 minutes)

Create `backend/.gitignore`:

```
# .NET build output
bin/
obj/
*.user
*.suo
*.userosscache
*.sln.docstates

# Visual Studio cache/options
.vs/
.vscode/

# User-specific files
*.userprefs

# Build results
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Bb]in/
[Oo]bj/

# NuGet Packages
*.nupkg
packages/

# Entity Framework migrations (keep initial)
# src/*/Migrations/*.cs
# !src/*/Migrations/*InitialCreate.cs

# Database files
*.db
*.db-shm
*.db-wal

# Docker volumes
postgres_data/

# IDE
.idea/
*.swp
*.swo
*~

# Environment files
.env
.env.local

# Logs
*.log
logs/

# Test results
TestResults/
*.trx
```

**Validation**: Backend .gitignore created

---

### Step 13: Commit Phase 1 (10 minutes)

```bash
# Navigate to project root
cd ../../../

# Stage all backend files
git add backend/

# Check status
git status
# Should show many new files in backend/

# Create comprehensive commit
git commit -m "$(cat <<'EOF'
feat: Phase 1 - Backend foundation complete

Clean Architecture implementation with .NET 9:

Solution Structure (6 projects):
- FootballPrediction.Api (Web API)
- FootballPrediction.Application (Business logic)
- FootballPrediction.Domain (Entities, interfaces)
- FootballPrediction.Infrastructure (Data access, EF Core)
- FootballPrediction.UnitTests (xUnit tests)
- FootballPrediction.IntegrationTests (Integration tests)

Domain Entities (5):
- User (with refresh token support)
- Tournament (competitions like Premier League)
- GameWeek (weekly periods within tournaments)
- Match (football matches with scores)
- Prediction (user predictions with points)

Database:
- PostgreSQL 16 in Docker (port 5433)
- Entity Framework Core 9
- 5 tables created with proper indexes and relationships
- Migrations applied using SQL script method

Features:
- Health check endpoint (/health)
- CORS configured
- Swagger UI available
- Connection string supports both local and Render formats

Build Status: ✅ 0 warnings, 0 errors

Next: Phase 2 - Authentication & Authorization
EOF
)"

# Update PROGRESS.md
# (Mark Phase 1 as complete, update Phase 2 as next)

git add PROGRESS.md
git commit -m "docs: Mark Phase 1 complete"

# Verify commits
git log --oneline -3
```

**Validation**: All changes committed

---

## ✅ VALIDATION CHECKLIST

See `validation/PHASE-01-CHECKLIST.md` for complete validation.

**Quick Validation**:
- [ ] 6 projects created in solution
- [ ] Solution builds with 0 warnings, 0 errors
- [ ] PostgreSQL running in Docker (port 5433)
- [ ] 5 tables exist in database (Users, Tournaments, GameWeeks, Matches, Predictions)
- [ ] Users table has RefreshToken and RefreshTokenExpiry columns
- [ ] Health check endpoint responds: `curl http://localhost:5000/health`
- [ ] Swagger UI accessible: http://localhost:5000/swagger
- [ ] All changes committed to git
- [ ] PROGRESS.md updated with Phase 1 complete

**If all checked**: ✅ Phase 1 Complete

---

## 🛡️ ERROR PREVENTION

### Critical Errors (from previous build)

See `error-prevention/PHASE-01-PREVENTION.md` for complete details.

**Error 1: dotnet-ef version mismatch**
```bash
# Symptom: System.Runtime Version=10.0.0.0 not found
# Solution: Use dotnet-ef v9.0.0
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0
```

**Error 2: EF migration not applying**
```bash
# Symptom: "Done" but no tables created
# Solution: Use SQL script method
dotnet ef migrations script --output migration.sql
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration.sql
```

**Error 3: Package version compatibility**
```bash
# Symptom: Package X not compatible with net9.0
# Solution: Use version 9.x packages
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.2
```

**Error 4: PostgreSQL port conflict**
```bash
# Symptom: Migrations apply but columns missing
# Solution: Use port 5433 for Docker
# Check: netstat -ano | findstr :5432
```

---

## 📊 COMPLETION CRITERIA

Phase 1 is **COMPLETE** when:

✅ All deliverables created
✅ All validation checks pass
✅ Build succeeds (0 warnings, 0 errors)
✅ Tests pass (none written yet, but solution compiles)
✅ Database operational (5 tables created)
✅ Health check responds
✅ All changes committed
✅ PROGRESS.md updated

---

## ⏭️ NEXT PHASE

**Phase 2: Authentication & Authorization**
- JWT token generation service
- User registration endpoint
- User login endpoint
- Refresh token mechanism
- BCrypt password hashing

**Preparation**:
- [ ] Read `phases/PHASE-02-AUTHENTICATION.md`
- [ ] Read `error-prevention/PHASE-02-PREVENTION.md`
- [ ] Ensure Phase 1 validation passes

---

## 🕐 TIME TRACKING

**Estimated**: 2-3 hours
**Typical Actual**: 2.5 hours
**Potential Delays**:
- dotnet-ef version issue: +30 min
- EF migration mystery: +45 min (prevented by SQL script method)
- PostgreSQL port conflict: +20 min (prevented by using 5433)

**With error prevention**: 2-2.5 hours

---

**Phase**: 1
**Version**: 2.0
**Last Updated**: 2026-03-05
**Status**: Production Ready
**Reference**: `.analysis/2026-02-06-phase-0-1-project-setup-analysis.md`
