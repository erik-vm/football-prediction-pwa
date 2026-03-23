# Error Prevention Guide v4.0

**Validated across 2 development cycles. Each error cost 15-60 minutes to resolve.**

## Category: Tooling

### ERROR 1: .NET SDK Version Mismatch
**Symptom**: Build fails with "The current .NET SDK does not support targeting .NET 9.0"
**Root Cause**: .NET 10 SDK installed, project targets .NET 9
**Prevention**: Run `dotnet --version` before starting. If v10+, create `global.json`:
```json
{ "sdk": { "version": "9.0.100", "rollForward": "latestMinor" } }
```

### ERROR 2: dotnet-ef Tool Version Mismatch
**Symptom**: Migration commands fail with version incompatibility
**Root Cause**: dotnet-ef v10 installed, project uses EF Core 9
**Prevention**: Install exact version: `dotnet tool install --global dotnet-ef --version 9.0.0`
**Verify**: `dotnet ef --version` must show 9.x

### ERROR 3: EF Migration Not Applying
**Symptom**: Tables not created despite successful migration command
**Root Cause**: `dotnet ef database update` reports success but doesn't create tables
**Prevention**: ALWAYS use SQL script method:
```bash
dotnet ef migrations script -o migration.sql
# Then apply via psql or DB tool
```

### ERROR 4: Package Version Mix
**Symptom**: Runtime errors, type load exceptions
**Root Cause**: Mixing .NET 9 and .NET 10 NuGet packages
**Prevention**: All `Microsoft.EntityFrameworkCore.*` packages must use same 9.0.x version

## Category: Infrastructure

### ERROR 5: PostgreSQL Port Conflict
**Symptom**: "address already in use" on port 5432
**Root Cause**: Another PostgreSQL instance running on default port
**Prevention**: Use port 5433 in docker-compose.yml: `ports: "5433:5432"`
**Verify**: `netstat -ano | findstr :5433` before starting

### ERROR 6: Docker Desktop Not Running
**Symptom**: "Cannot connect to Docker daemon"
**Prevention**: Document in setup that Docker Desktop must be started manually before development

### ERROR 7: PostgreSQL URL Format (Render)
**Symptom**: "Failed to connect to database" in production
**Root Cause**: Render provides `postgres://` URL, Npgsql expects `Host=...;Port=...;Database=...`
**Prevention**: Add URL parser in Program.cs that handles both formats:
```csharp
// Handle postgres:// and postgresql:// URL schemes
if (connStr.StartsWith("postgres://") || connStr.StartsWith("postgresql://"))
{
    var uri = new Uri(connStr.Replace("postgres://", "https://").Replace("postgresql://", "https://"));
    var userInfo = uri.UserInfo.Split(':');
    var port = uri.Port > 0 ? uri.Port : 5432;
    connStr = $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}
```
**CRITICAL**: Handle missing port (default to 5432) and both URI schemes.

## Category: Frontend

### ERROR 8: Tailwind CSS v4 Incompatibility
**Symptom**: Styles not applied, PostCSS errors
**Root Cause**: Tailwind v4 changed configuration format, incompatible with Angular 19
**Prevention**: Install exactly: `npm install tailwindcss@3.4.17 postcss autoprefixer`
**Verify**: Check `package.json` shows `"tailwindcss": "^3.4.17"`

### ERROR 9: Angular 19 Output Directory
**Symptom**: Build output not found at expected location
**Root Cause**: Angular 19 uses `dist/<project>/browser/` not `dist/<project>/`
**Prevention**: In `angular.json`, verify `outputPath`. For Vercel, set output dir to `dist/frontend/browser`

### ERROR 10: Angular fileReplacements for Production
**Symptom**: Production build uses development API URL
**Root Cause**: Missing `fileReplacements` in production build config
**Prevention**: In `angular.json` under `configurations.production`:
```json
"fileReplacements": [{
  "replace": "src/environments/environment.ts",
  "with": "src/environments/environment.prod.ts"
}]
```

### ERROR 11: Angular Catch-All Route
**Symptom**: NG04002 error on unknown routes
**Root Cause**: Missing wildcard route
**Prevention**: Add `{ path: '**', redirectTo: '' }` as LAST route in app.routes.ts

## Category: Deployment

### ERROR 12: Vercel SPA Routing
**Symptom**: 404 on page refresh for deep links
**Root Cause**: Vercel serves static files, doesn't know about Angular routes
**Prevention**: Add `vercel.json` with rewrite rule:
```json
{ "rewrites": [{ "source": "/((?!assets|.*\\.).*)", "destination": "/index.html" }] }
```

### ERROR 13: CORS Configuration
**Symptom**: CORS errors in browser console
**Root Cause**: Backend CORS policy doesn't include frontend URL
**Prevention**: Configure CORS with all known origins:
- `http://localhost:4200` (development)
- Production Vercel URL (exact)
- `*.vercel.app` pattern for preview deployments
**CRITICAL**: Vercel preview URLs change per deployment. Use flexible matching:
```csharp
.SetIsOriginAllowed(origin => origin.Contains("vercel.app") || origin.Contains("localhost"))
```

### ERROR 14: Dockerfile Restore
**Symptom**: Docker build fails at restore step
**Root Cause**: Missing project references in multi-stage build
**Prevention**: Copy ALL .csproj files before restore, but only restore the API project:
```dockerfile
COPY backend/src/FootballPrediction.Api/*.csproj ./src/FootballPrediction.Api/
COPY backend/src/FootballPrediction.Application/*.csproj ./src/FootballPrediction.Application/
COPY backend/src/FootballPrediction.Domain/*.csproj ./src/FootballPrediction.Domain/
COPY backend/src/FootballPrediction.Infrastructure/*.csproj ./src/FootballPrediction.Infrastructure/
RUN dotnet restore src/FootballPrediction.Api/FootballPrediction.Api.csproj
```

## Category: Backend Logic

### ERROR 15: JSON Serialization Cycles
**Symptom**: Stack overflow or infinite loop in API responses
**Root Cause**: EF Core navigation properties create circular references
**Prevention**: Add to Program.cs:
```csharp
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
```

### ERROR 16: Background Job Scoring Gap
**Symptom**: Predictions not scored after match finishes
**Root Cause**: Hourly sync updates match scores but doesn't trigger scoring
**Prevention**: Call `ScorePendingPredictionsAsync()` in BOTH:
- `SyncCompetitionMatchesAsync()` (full sync)
- `UpdateRecentMatchesAsync()` (hourly update)

### ERROR 17: Idempotent Match Sync
**Symptom**: Duplicate match records in database
**Root Cause**: Sync job creates new records instead of updating existing
**Prevention**: Always check for existing match by (CompetitionCode, HomeTeam, AwayTeam, Matchday) before inserting

### ERROR 18: Navigation Properties Must Be Nullable
**Symptom**: EF Core throws on queries with optional relations
**Prevention**: All navigation properties use `?` (nullable reference):
```csharp
public Tournament? Tournament { get; set; }
public GameWeek? GameWeek { get; set; }
```
