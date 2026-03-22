# Error Prevention Guide - Complete Reference

**Version**: 2.0
**Created**: 2026-03-05
**Based on**: Real errors from `.analysis/` folder (February-March 2026 build sessions)

---

## 🎯 PURPOSE

This document contains **EVERY KNOWN ERROR** encountered during the previous build, with:
- ✅ Exact error messages
- ✅ Root causes
- ✅ Working solutions (with commands)
- ✅ Prevention strategies
- ✅ Time saved by avoiding

**Read the prevention guide for your current phase BEFORE starting work.**

---

## 📊 ERROR STATISTICS (Previous Build + Current Session)

- **Total Blockers**: 14 major + 11 minor = 25 errors
- **Time Lost**: ~6.75 hours (15% of total development time)
- **Most Costly**: EF migration mystery (45 min), dotnet-ef version (30 min)
- **Most Frequent**: Package version mismatches (6 occurrences)
- **Latest**: Dockerfile restore fails on excluded test projects (15 min, Phase 19)

**This guide can save you 6+ hours.**

---

## 🚨 CRITICAL ERRORS (Must Prevent)

### ❌ ERROR 1: dotnet-ef Tool Version Mismatch
**Phase**: 1 (Backend Foundation)
**Time Lost**: 30 minutes
**Severity**: HIGH

#### Exact Error
```
Unhandled exception. System.IO.FileNotFoundException:
Could not load file or assembly 'System.Runtime, Version=10.0.0.0'
```

#### Root Cause
- Global `dotnet-ef` tool version 10.0.1 installed
- Project uses .NET 9 / EF Core 9
- Version 10 tool cannot work with version 9 projects
- Error message misleading (says System.Runtime, but it's tool version)

#### Failed Attempts
1. ❌ Added `IDesignTimeDbContextFactory` - didn't help
2. ❌ Tried running from different project contexts - same error
3. ❌ Tried `--force` flag - not recognized

#### ✅ WORKING SOLUTION
```bash
# Check current version
dotnet ef --version

# Uninstall if v10.x
dotnet tool uninstall --global dotnet-ef

# Install v9.0.0 exactly
dotnet tool install --global dotnet-ef --version 9.0.0

# Verify
dotnet ef --version
# Should output: Entity Framework Core .NET Command-line Tools 9.0.0
```

#### 🛡️ PREVENTION
**BEFORE Phase 1:**
```bash
# 1. Check .NET SDK version
dotnet --version
# Note: 10.x SDK is OK

# 2. Check target framework in any .csproj
grep TargetFramework backend/src/FootballPrediction.Domain/FootballPrediction.Domain.csproj
# Should be: <TargetFramework>net9.0</TargetFramework>

# 3. Install matching dotnet-ef version
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0

# 4. Verify
dotnet ef --version
```

#### Time Saved
**30 minutes** if you run prevention check

---

### ❌ ERROR 2: EF Migration Not Actually Applying
**Phase**: 1 (Backend Foundation)
**Time Lost**: 45 minutes (MOST FRUSTRATING)
**Severity**: HIGH

#### The Mystery
- `dotnet ef database update` reported **"Done"** and **"Applying migration"**
- But tables **weren't actually created** in database
- Database queries showed **no tables**
- Re-running update claimed **tables already exist**
- Very confusing state - logs said success but nothing in DB

#### Investigation Steps Tried
1. ✅ Checked Docker container - running and healthy
2. ✅ Checked database exists - yes
3. ❌ `\dt` showed no tables
4. ❌ Direct table queries failed
5. ✅ EF said "relation 'Tournaments' already exists"
6. ❌ But PostgreSQL said "relation does not exist"

**Contradiction**: EF thinks tables exist, PostgreSQL disagrees

#### Root Cause (Suspected)
- EF Core 9.0.0 tool with .NET 9 project had internal state corruption
- Migration history tracking got out of sync
- Possibly related to earlier failed attempts with v10 tool
- Build artifacts caching issue

#### Failed Solutions
1. ❌ Rebuilt project - same issue
2. ❌ Removed and recreated migration - same issue
3. ❌ Dropped and recreated database - STILL same issue!

#### ✅ WORKING SOLUTION
**Use SQL script generation method (bypasses EF execution engine)**:

```bash
# Navigate to Infrastructure project
cd backend/src/FootballPrediction.Infrastructure

# Generate SQL script from migration
dotnet ef migrations script --output migration.sql

# Apply directly to PostgreSQL (bypasses EF)
cd ../../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < backend/src/FootballPrediction.Infrastructure/migration.sql

# Verify tables created
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'

# Should output:
# List of relations
#  Schema |       Name        | Type  |  Owner
# --------+-------------------+-------+----------
#  public | Matches           | table | postgres
#  public | Predictions       | table | postgres
#  public | Tournaments       | table | postgres
#  public | Users             | table | postgres
#  public | __EFMigrationsHistory | table | postgres
```

#### Why This Works
- Bypasses EF Core's migration execution engine
- Direct SQL application to PostgreSQL
- No intermediate caching or state issues
- Verifiable output from PostgreSQL
- Can inspect migration.sql before applying

#### 🛡️ PREVENTION
**ALWAYS use SQL script method for initial setup:**

```bash
# Create migration
dotnet ef migrations add InitialCreate --project src/FootballPrediction.Infrastructure --startup-project src/FootballPrediction.Api

# Generate SQL (do NOT use 'database update')
dotnet ef migrations script --output migration.sql --project src/FootballPrediction.Infrastructure --startup-project src/FootballPrediction.Api

# Apply SQL
docker exec -i football_prediction_db psql -U postgres -d football_prediction < backend/src/FootballPrediction.Infrastructure/migration.sql

# Verify (should show 5+ tables)
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'
```

**For subsequent migrations:**
```bash
# Generate incremental script
dotnet ef migrations script PreviousMigration NewMigration --output migration-incremental.sql

# Review SQL first!
cat migration-incremental.sql

# Apply if looks good
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration-incremental.sql
```

#### Time Saved
**45 minutes** if you use SQL script method from the start

---

### ❌ ERROR 3: Package Version Compatibility (.NET 10 packages with .NET 9)
**Phase**: 1 (Backend Foundation)
**Time Lost**: 15 minutes
**Severity**: MEDIUM

#### Exact Error
```
error NU1202: Package Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 is not compatible with net9.0 (.NETCoreApp,Version=v9.0).
Package Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0 supports: net10.0 (.NETCoreApp,Version=v10.0)
```

#### Root Cause
- .NET 10 SDK installed on system
- Project targeting .NET 9 (`<TargetFramework>net9.0</TargetFramework>`)
- Attempted to install .NET 10 packages (Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0)
- **Mistake**: Packages must match target framework, NOT SDK version

#### ✅ WORKING SOLUTION
```bash
# 1. Check target framework in .csproj
cat backend/src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj | grep TargetFramework
# Should be: <TargetFramework>net9.0</TargetFramework>

# 2. Install matching package versions (version 9.x for net9.0)
cd backend/src/FootballPrediction.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.2
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0

# 3. Verify in .csproj
cat FootballPrediction.Infrastructure.csproj
```

#### 🛡️ PREVENTION
**Use exact versions from TECH-STACK.md:**

```xml
<!-- backend/src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj -->
<ItemGroup>
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.2" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.0" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.0" />
</ItemGroup>
```

**Rule**: EF Core packages version should match `<TargetFramework>`, NOT SDK version.

#### Time Saved
**15 minutes** by using correct versions from the start

---

### ❌ ERROR 4: PostgreSQL Port Conflict (Docker + Windows Service)
**Phase**: 2 (Authentication)
**Time Lost**: 20 minutes
**Severity**: HIGH (Silent failure - connects to wrong database!)

#### The Mystery
- EF migrations appeared to work
- But new columns (RefreshToken, RefreshTokenExpiry) weren't in database
- API returned errors about missing columns
- Confused: migrations said success, but columns missing

#### Root Cause - SNEAKY!
- **Two PostgreSQL instances running**:
  1. Docker container on port 5432 (NEW, correct database)
  2. Windows PostgreSQL service on port 5432 (OLD, wrong schema)
- Connection string used port 5432
- **EF Core connected to Windows service** (wrong database!)
- Migrations applied to Windows database (not Docker)
- Old schema didn't have RefreshToken columns

#### ✅ WORKING SOLUTION
```bash
# 1. Stop Windows PostgreSQL service
net stop postgresql-x64-16

# OR change Docker port (better - doesn't conflict)

# 2. Update docker-compose.yml
ports:
  - "5433:5432"  # Changed from 5432:5432

# 3. Update connection string in appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres"
}

# 4. Restart Docker
docker-compose down
docker-compose up -d

# 5. Apply migrations to CORRECT database
dotnet ef migrations script --output migration.sql
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration.sql

# 6. Verify columns exist
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\d \"Users\""
# Should show RefreshToken and RefreshTokenExpiry columns
```

#### 🛡️ PREVENTION
**BEFORE starting Phase 1:**

```bash
# 1. Check for existing PostgreSQL processes
netstat -ano | findstr :5432
# If output shows PID, another PostgreSQL is running

# 2. Stop Windows PostgreSQL if exists
net stop postgresql-x64-16

# 3. Use non-conflicting port for Docker
# docker-compose.yml:
ports:
  - "5433:5432"

# 4. Connection string:
Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres
```

#### Time Saved
**20 minutes** and prevents silent data corruption

---

### ❌ ERROR 5: Docker Desktop Not Running
**Phase**: 1 (Backend Foundation)
**Time Lost**: 2 minutes (user action required)
**Severity**: LOW (expected)

#### Error
```
docker-compose up -d
ERROR: Cannot connect to the Docker daemon. Is the docker daemon running?
```

#### ✅ SOLUTION
User must start Docker Desktop manually.

#### 🛡️ PREVENTION
**Add to Phase 1 checklist:**
```bash
# Verify Docker running
docker ps
# Should list containers (or be empty but not error)
```

---

### ❌ ERROR 6: Tailwind CSS v4 PostCSS Incompatibility with Angular 19
**Phase**: 7/8 (Frontend Foundation)
**Time Lost**: 10 minutes
**Severity**: MEDIUM

#### Exact Error
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

#### Root Cause
- Tailwind CSS v4 changed architecture
- v4 requires `@tailwindcss/postcss` package instead of direct `tailwindcss`
- Angular 19 build system (esbuild + Angular CLI) not compatible with this new structure
- Even installing `@tailwindcss/postcss` doesn't fully resolve compatibility

#### Failed Attempts
1. ❌ Tried `npm install -D @tailwindcss/postcss@4.0.0 tailwindcss@4.0.0` - still incompatible
2. ❌ Attempted to configure PostCSS separately - Angular 19 uses esbuild internally

#### ✅ WORKING SOLUTION
Use Tailwind CSS v3.4.17 (stable, fully compatible):
```bash
# Uninstall v4
npm uninstall tailwindcss @tailwindcss/postcss

# Install v3
npm install -D tailwindcss@3.4.17 postcss autoprefixer

# Create tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: [],
}

# Update src/styles.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 🛡️ PREVENTION
**ALWAYS use Tailwind v3 with Angular 19:**
```bash
npm install -D tailwindcss@3.4.17 postcss autoprefixer
```

**DO NOT install Tailwind v4 or @tailwindcss/postcss**

#### Time Saved
**10 minutes** by using v3 from the start

---

### ❌ ERROR 6.5: AuthService Method Signature Mismatch
**Phase**: 9 (Authentication UI)
**Time Lost**: 5 minutes
**Severity**: LOW

#### Exact Error
```
TS2554: Expected 1 arguments, but got 2.
  src/app/features/auth/login.component.ts:131:34:
    131 │     this.authService.login(email, password).subscribe({
                                          ~~~~~~~~

TS2554: Expected 1 arguments, but got 3.
  src/app/features/auth/register.component.ts:212:40:
    212 │     this.authService.register(username, email, password).subscribe({
                                                ~~~~~~~~~~~~~~~
```

#### Root Cause
- AuthService methods expect request objects (DTOs), not individual parameters
- AuthService.login() expects `LoginRequest` object: `{ email, password }`
- AuthService.register() expects `RegisterRequest` object: `{ username, email, password }`
- Components initially called methods with individual parameters

#### Failed Approach
```typescript
// ❌ Wrong - passing individual parameters
this.authService.login(email, password).subscribe(...)
this.authService.register(username, email, password).subscribe(...)
```

#### ✅ WORKING SOLUTION
```typescript
// LoginComponent
const request = this.loginForm.getRawValue(); // Returns { email, password }
this.authService.login(request).subscribe(...)

// RegisterComponent
const { username, email, password } = this.registerForm.getRawValue();
const request = { username, email, password };
this.authService.register(request).subscribe(...)
```

#### 🛡️ PREVENTION
**Check AuthService method signatures BEFORE implementing components:**
```typescript
// Always check the service interface first
login(request: LoginRequest): Observable<AuthResponse>
register(request: RegisterRequest): Observable<AuthResponse>
```

**Use form.getRawValue() directly when structure matches DTO:**
```typescript
// If form structure matches DTO exactly, use directly
const request = this.loginForm.getRawValue();
this.authService.login(request).subscribe(...)
```

#### Time Saved
**5 minutes** by checking service signatures first

---

### ❌ ERROR 7: Angular 19 New Output Directory Structure
**Phase**: 19 (Deployment)
**Time Lost**: 10 minutes
**Severity**: MEDIUM

#### Problem
- Vercel deployment succeeded
- But application showed "404 - File not found"
- Vercel was looking in `dist/frontend/` but Angular 19 outputs to `dist/frontend/browser/`

#### Root Cause
- Angular 19 changed output structure
- Old: `dist/frontend/` contained index.html
- New: `dist/frontend/browser/` contains index.html
- Vercel config had old path

#### ✅ WORKING SOLUTION
Update `vercel.json`:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist/frontend/browser",
  "installCommand": "echo 'Skipping root install'"
}
```

#### 🛡️ PREVENTION
**For Angular 19 projects, always use:**
```
outputDirectory: "frontend/dist/frontend/browser"
```

#### Time Saved
**10 minutes** by using correct path from start

---

### ❌ ERROR 7: SPA Routing 404 Errors on Vercel
**Phase**: 19 (Deployment)
**Time Lost**: 15 minutes
**Severity**: MEDIUM

#### Problem
- Routes like `/register` and `/login` returned 404
- Vercel was looking for physical files
- SPA routing requires all routes → index.html

#### Naive Solution (WRONG)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
**Problem**: This rewrites EVERYTHING including `manifest.webmanifest`, `ngsw-worker.js`, `.js` files → breaks PWA!

#### ✅ WORKING SOLUTION
**Use negative lookahead** to exclude files with dots:
```json
{
  "rewrites": [
    {
      "source": "/((?!.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Explanation**:
- `/((?!.*\\.).*)` = "Match paths that DON'T contain a dot"
- `/register` (no dot) → rewritten to `/index.html` ✅
- `/manifest.webmanifest` (has dot) → served directly ✅
- `/ngsw-worker.js` (has dot) → served directly ✅

#### 🛡️ PREVENTION
**Always use negative lookahead pattern for Angular SPAs on Vercel.**

#### Time Saved
**15 minutes** and prevents broken PWA

---

### ❌ ERROR 8: Render PostgreSQL URL Format Incompatibility
**Phase**: 19 (Deployment)
**Time Lost**: 20 minutes
**Severity**: HIGH

#### Problem
- Render provides database URL: `postgresql://user:pass@host:port/db`
- Npgsql expects: `Host=host;Port=port;Database=db;Username=user;Password=pass`
- Application crashed on startup with connection error

#### ✅ WORKING SOLUTION
Add URL parser in `Program.cs`:

```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"];

if (connectionString != null && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    // Parse PostgreSQL URL to Npgsql format
    var uri = new Uri(connectionString);
    var host = uri.Host;
    var port = uri.Port > 0 ? uri.Port : 5432;  // CRITICAL: Render internal URLs omit port, uri.Port returns -1
    var database = uri.AbsolutePath.TrimStart('/');
    var userInfo = uri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

#### ⚠️ CRITICAL DETAILS (from v2 deployment 2026-03-22)
1. **Must handle BOTH `postgres://` AND `postgresql://`** — Render's `fromDatabase` `connectionString` property uses `postgresql://`
2. **Must default port to 5432** when `uri.Port` returns `-1` — Render internal connection strings omit the port
3. **Never use ternary `:` directly inside interpolated strings** — C# treats `:` as format specifier. Extract to variable first.

#### 🛡️ PREVENTION
**Include this parser in Program.cs from Phase 1** (even for local development - it's harmless).

#### Time Saved
**35 minutes** (20 min original + 15 min from port/-1 issue in v2 deployment)

---

### ❌ ERROR 9: Localhost Connection String in Production
**Phase**: 19 (Deployment)
**Time Lost**: 10 minutes
**Severity**: HIGH

#### Problem
- `appsettings.json` had localhost connection string
- This file is copied into Docker image
- Production container tried to connect to localhost (doesn't exist)
- **Result**: Database connection failed in production

#### ✅ WORKING SOLUTION
**Separate configurations:**

1. **appsettings.json** (NO connection string)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

2. **appsettings.Development.json** (local only)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres"
  }
}
```

3. **Production** uses `DATABASE_URL` environment variable (Render provides)

#### 🛡️ PREVENTION
**NEVER put localhost connection strings in appsettings.json** (only in appsettings.Development.json).

#### Time Saved
**10 minutes** and prevents production outages

---

### ❌ ERROR 10: Vercel Deployment Protection Blocking Access
**Phase**: 19 (Deployment)
**Time Lost**: 5 minutes
**Severity**: LOW

#### Problem
- All routes returned 401 Unauthorized
- Even public pages like login
- Confusing: no authentication code should run for login page

#### Root Cause
- Vercel "Deployment Protection" feature enabled
- Requires Vercel account authentication to view site
- Intended for staging, but was ON for production

#### ✅ SOLUTION
1. Go to Vercel dashboard
2. Project Settings → Deployment Protection
3. Disable for production deployment

#### 🛡️ PREVENTION
**Check Vercel project settings** before declaring deployment complete.

#### Time Saved
**5 minutes** of head-scratching

---

## 📋 PREVENTION CHECKLIST BY PHASE

### Phase 0: Setup
```bash
# No critical errors
✅ Create git repository
✅ Create tracking documents
```

### Phase 1: Backend Foundation
```bash
# ✅ CHECK 1: dotnet-ef version
dotnet ef --version
# Must be 9.0.0 for .NET 9 projects

# ✅ CHECK 2: No PostgreSQL port conflicts
netstat -ano | findstr :5432
# Should be empty or stop Windows PostgreSQL

# ✅ CHECK 3: Docker running
docker ps

# ✅ CHECK 4: Use SQL script method (not 'database update')
dotnet ef migrations script --output migration.sql
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration.sql
```

**Time saved: 90 minutes**

### Phase 2: Authentication
```bash
# ✅ CHECK 1: Verify Docker database has new columns
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\d \"Users\""
# Should show RefreshToken, RefreshTokenExpiry

# ✅ CHECK 2: Connection string uses correct port
grep "Port=" backend/src/FootballPrediction.Api/appsettings.Development.json
# Should match docker-compose.yml port (5433 if changed)
```

**Time saved: 20 minutes**

### Phase 3: Scoring Logic
```bash
# ✅ CHECK 1: Read GAME-RULES.md completely
# ✅ CHECK 2: Reference ScoringService.java from correct repo
# ✅ CHECK 3: Run all 29 tests before committing
dotnet test --filter FullyQualifiedName~ScoringServiceTests
```

**Time saved: 0 minutes (no errors in this phase historically)**

### Phase 19: Deployment
```bash
# ✅ CHECK 1: Angular output directory
cat vercel.json | grep outputDirectory
# Should be: "frontend/dist/frontend/browser"

# ✅ CHECK 2: Negative lookahead rewrite
cat vercel.json | grep "source"
# Should be: "/((?!.*\\.).*)"

# ✅ CHECK 3: No localhost in appsettings.json
cat backend/src/FootballPrediction.Api/appsettings.json | grep ConnectionStrings
# Should NOT have ConnectionStrings

# ✅ CHECK 4: URL parser in Program.cs
grep "postgresql://" backend/src/FootballPrediction.Api/Program.cs
# Should have URL parsing logic

# ✅ CHECK 5: Vercel Deployment Protection OFF
# Manual check in Vercel dashboard

# ✅ CHECK 6: Dockerfile restores API project only (not full .sln)
grep "dotnet restore" Dockerfile
# Should target: src/FootballPrediction.Api/FootballPrediction.Api.csproj
# Should NOT be: dotnet restore (bare, targets .sln which includes excluded test projects)

# ✅ CHECK 7: Dockerfile COPY matches .dockerignore exclusions
grep "COPY backend" Dockerfile
# Should copy backend/src/ not backend/ (tests excluded via .dockerignore)

# ✅ CHECK 8: Connection string parser handles both URI schemes AND missing port
grep "postgres://" backend/src/FootballPrediction.Api/Program.cs
# Must check for BOTH postgres:// and postgresql://
# Must default port to 5432 when uri.Port returns -1

# ✅ CHECK 9: Production API URL matches actual Render service URL
cat frontend/src/environments/environment.prod.ts
# Must match the actual Render URL (e.g. football-prediction-api-316o, not generic name)
```

**Time saved: 90 minutes**

---

## 📊 TOTAL TIME SAVINGS

If you follow all prevention checks:
- **Phase 1**: 90 minutes saved
- **Phase 2**: 20 minutes saved
- **Phase 19**: 90 minutes saved (Dockerfile, connection string, port, API URL)
- **Minor issues**: 30 minutes saved

**TOTAL: ~4 hours saved** = 10% of total development time

---

---

## 🆕 NEW ERRORS (Session 2026-03-19)

### ❌ ERROR 7.1: IHttpClientFactory Missing Namespace
**Phase**: 14 (football-data.org Integration)
**Time Lost**: 5 minutes
**Severity**: MINOR

#### Exact Error
```
error CS0246: The type or namespace name 'IHttpClientFactory' could not be found
```

#### Root Cause
- Used `IHttpClientFactory` in Infrastructure project
- Package `Microsoft.Extensions.Http` not referenced
- Namespace `Microsoft.Extensions.Http` doesn't exist in base project

#### ✅ SOLUTION
```bash
cd backend/src/FootballPrediction.Infrastructure
dotnet add package Microsoft.Extensions.Http
```

Then add using statements:
```csharp
using Microsoft.Extensions.Http;
using System.Net.Http;
```

#### 🛡️ PREVENTION
**Always add Microsoft.Extensions.Http package** when using IHttpClientFactory in Infrastructure layer.

#### Time Saved
**5 minutes** of troubleshooting

---

### ❌ ERROR 7.2: SignalR Package Version Confusion
**Phase**: 17 (Real-time Updates)
**Time Lost**: 2 minutes
**Severity**: MINOR

#### Issue
- Multiple SignalR packages available
- Version confusion (1.1.0 vs latest)

#### ✅ SOLUTION
For .NET 9 with ASP.NET Core:
```bash
dotnet add package Microsoft.AspNetCore.SignalR --version 1.1.0
```

SignalR is included in ASP.NET Core framework, but adding package explicitly helps with IntelliSense and ensures compatibility.

#### 🛡️ PREVENTION
**Use version 1.1.0** for .NET 9 projects to match framework version.

---

### ❌ ERROR 7.3: Dockerfile dotnet restore Fails - Test Projects Not Found
**Phase**: 19 (Deployment)
**Time Lost**: 15 minutes (2 failed Render builds)
**Severity**: HIGH

#### Exact Error
```
error MSB3202: The project file "/src/tests/FootballPrediction.UnitTests/FootballPrediction.UnitTests.csproj" was not found.
```

#### Root Cause
- `.dockerignore` excludes `**/tests/` directories
- Dockerfile runs `dotnet restore` on the full `.sln` file
- Solution file references test projects that are excluded from Docker context
- Restore fails because test `.csproj` files don't exist in the container

#### ✅ SOLUTION
Restore only the API project instead of the full solution:
```dockerfile
# DON'T: RUN dotnet restore
# DO: Target API project directly (pulls in src dependencies via project refs)
RUN dotnet restore src/FootballPrediction.Api/FootballPrediction.Api.csproj
```

Also copy only `backend/src/` (not `backend/`) for the build step:
```dockerfile
# DON'T: COPY backend/ ./
# DO: Copy only source projects
COPY backend/src/ ./src/
RUN dotnet publish src/FootballPrediction.Api/FootballPrediction.Api.csproj -c Release -o /app/publish --no-restore
```

#### 🛡️ PREVENTION
- **Always check `.dockerignore`** before writing COPY/RESTORE commands in Dockerfile
- **Never use `dotnet restore` on full solution** when test projects are excluded
- **Target the API .csproj directly** for restore and publish

#### Time Saved
**15 minutes** (2 failed Render builds at ~5-8 min each)

---

## 🎯 GOLDEN RULES

### 1. Always Check Tool Versions
```bash
dotnet --version        # 10.x OK (SDK)
dotnet ef --version     # MUST be 9.0.0 for .NET 9
node --version          # 20.x LTS
npm --version           # 10.x
```

### 2. Always Use SQL Script Method for Migrations
```bash
# NEVER use: dotnet ef database update
# ALWAYS use:
dotnet ef migrations script --output migration.sql
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration.sql
```

### 3. Always Check for Port Conflicts
```bash
netstat -ano | findstr :5432
netstat -ano | findstr :5000
netstat -ano | findstr :4200
```

### 4. Always Separate Dev/Prod Configuration
- appsettings.json → NO connection strings
- appsettings.Development.json → localhost OK
- Production → environment variables

### 5. Always Use Package Versions from TECH-STACK.md
Don't guess, don't use latest, use specified versions.

---

## 🆘 WHEN BLOCKED

### Step 1: Search This Document
**Ctrl+F** for your error message or symptom

### Step 2: Check .analysis Folder
Previous build session analyses might have solution:
```
.analysis/2026-02-06-phase-0-1-project-setup-analysis.md
.analysis/2026-03-04-production-deployment-analysis.md
etc.
```

### Step 3: Check Reference Implementation
```
C:\Projects\football-prediciton-game (Spring Boot - correct)
```

### Step 4: Ask User
Provide:
- Phase number
- Exact error message
- What you've tried
- Environment details (dotnet version, package versions, etc.)

---

---

## 🆕 NEW ERRORS (Session 2026-03-22 — P0/P1 Rebuild)

### ❌ ERROR 11: Navigation Property Required by Model Binder (400 Bad Request)
**Phase**: P0 (Predictions, Match CRUD)
**Time Lost**: 30 minutes (across Match and Prediction entities)
**Severity**: HIGH

#### Exact Error
```
{"errors":{"Tournament":["The Tournament field is required."]}}
{"errors":{"User":["The User field is required."],"Match":["The Match field is required."]}}
```

#### Root Cause
- EF Core entities had non-nullable navigation properties: `public Tournament Tournament { get; set; } = null!;`
- ASP.NET model binder treats these as required fields on POST/PUT
- API rejects requests that don't include full nested objects

#### ✅ SOLUTION
Make navigation properties nullable:
```csharp
// BEFORE (breaks API)
public Tournament Tournament { get; set; } = null!;
public User User { get; set; } = null!;
public Match Match { get; set; } = null!;

// AFTER (works)
public Tournament? Tournament { get; set; }
public User? User { get; set; }
public Match? Match { get; set; }
```

#### 🛡️ PREVENTION
**ALL navigation properties on domain entities MUST be nullable** when the entity is used directly as a controller parameter.

---

### ❌ ERROR 12: CORS Blocking Vercel Preview URLs
**Phase**: Deployment
**Time Lost**: 10 minutes
**Severity**: MEDIUM

#### Root Cause
Hardcoded CORS origins don't match Vercel preview deployment URLs (which include commit hashes).

#### ✅ SOLUTION
Use `SetIsOriginAllowed` with pattern matching instead of `WithOrigins`:
```csharp
policy.SetIsOriginAllowed(origin =>
    origin.Contains("localhost") ||
    origin.Contains("vercel.app") ||
    origin.Contains("football-prediction"))
```

---

### ❌ ERROR 13: Prediction FK Constraint — userId Not in DB
**Phase**: P0 (Predictions)
**Time Lost**: 15 minutes
**Severity**: HIGH

#### Exact Error
```
ConstraintName: FK_Predictions_Users_UserId
```

#### Root Cause
- Frontend sent userId from localStorage
- User was registered in a different session, userId didn't exist in current DB
- Backend trusted client-provided userId instead of extracting from JWT

#### ✅ SOLUTION
1. Add `[Authorize]` to PredictionsController
2. Extract userId from JWT claims via `User.FindFirst("sub")`
3. Never trust client-provided userId

---

### ❌ ERROR 14: Fake Seed Data Mixed with Real API Data
**Phase**: P0 (Football Data Sync)
**Time Lost**: 45 minutes
**Severity**: HIGH

#### Root Cause
- Database had fake hardcoded matches (Arsenal vs Chelsea, etc.) with obvious GUIDs
- Football-data.org sync added real matches alongside fakes
- Users saw wrong fixtures and couldn't distinguish

#### ✅ SOLUTION
1. Delete all matches belonging to fake tournament IDs
2. Delete fake tournaments
3. Re-sync from football-data.org with `?season=YYYY` (full season, not date range)

#### 🛡️ PREVENTION
- NEVER seed fake match data into production DB
- Use football-data.org sync from day one
- Use `?season=YYYY` parameter to get full season data (not `dateFrom/dateTo`)

---

### ❌ ERROR 15: Duplicate Matches from Multiple Syncs
**Phase**: P0 (Football Data Sync)
**Time Lost**: 20 minutes
**Severity**: MEDIUM

#### Root Cause
- Each sync run created new matches instead of updating existing ones
- Dedup logic matched on `CompetitionCode + HomeTeam + AwayTeam + Matchday + Season`
- But when tournaments were deleted and recreated, matches got new tournament IDs

#### ✅ SOLUTION
- Match lookup should NOT include Season (it may differ slightly)
- Use `CompetitionCode + HomeTeam + AwayTeam + Matchday` as unique key
- Added `CleanupDuplicatesAsync()` method as safety net

---

**Version**: 3.0
**Updated**: 2026-03-22
**Based on**: Real errors from 50+ hours of development
**Time Savings**: ~5 hours if followed
**Status**: Production-validated error prevention guide

**Remember**: Every minute spent on prevention saves 5-10 minutes of debugging.
