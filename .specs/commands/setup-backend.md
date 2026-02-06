# Backend Setup Commands

**Purpose:** Initial backend project setup and verification
**Used by:** Developer Agent, Setup Agent
**When:** Starting new development session or onboarding new developer

---

## Prerequisites Verification

```bash
# Check .NET SDK version (should be 9.x or 10.x)
dotnet --version

# Check dotnet-ef tool version (MUST be 9.0.x for .NET 9 projects)
dotnet ef --version

# If wrong version, fix it:
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0

# Check Docker
docker --version
docker info  # Should not error - Docker must be running
```

---

## Database Setup

```bash
# Navigate to backend directory
cd backend

# Start PostgreSQL container
docker-compose up -d

# Wait for healthy status (check every 2 seconds)
while ! docker-compose ps | grep "healthy"; do sleep 2; done

# Verify container is running
docker ps | grep football_prediction_db

# Check PostgreSQL logs
docker logs football_prediction_db
```

---

## Database Migration (Recommended Method)

```bash
# Navigate to Infrastructure project
cd backend/src/FootballPrediction.Infrastructure

# Generate SQL script from migrations
dotnet ef migrations script --output migration.sql

# Apply SQL script to database
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql

# Verify tables created
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'

# Should show:
# - GameWeeks
# - Matches
# - Predictions
# - Tournaments
# - Users
# - __EFMigrationsHistory
```

---

## Alternative: Direct EF Update Method

```bash
cd backend/src/FootballPrediction.Infrastructure

# Apply migrations (may have issues, use SQL script method if this fails)
dotnet ef database update

# Verify
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'
```

---

## Build & Run

```bash
# From backend directory
cd backend

# Restore packages
dotnet restore

# Build solution
dotnet build

# Should output:
# Build succeeded.
#     0 Warning(s)
#     0 Error(s)

# Run API
dotnet run --project src/FootballPrediction.Api

# API should start on http://localhost:5206 (or similar)
```

---

## Verification

```bash
# Test health endpoint
curl http://localhost:5206/health

# Expected response:
# {"status":"healthy","timestamp":"2026-02-06T..."}

# Check database tables
docker exec football_prediction_db psql -U postgres -d football_prediction -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

# Verify Users table structure
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\d "Users"'
```

---

## Troubleshooting

### If migration fails

```bash
# Clean slate approach
cd backend
docker-compose down
docker volume rm backend_postgres_data
docker-compose up -d
sleep 5

# Use SQL script method (most reliable)
cd src/FootballPrediction.Infrastructure
dotnet ef migrations script --output migration.sql
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql
```

### If dotnet-ef tool has wrong version

```bash
# Uninstall and reinstall correct version
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0
dotnet ef --version  # Verify 9.0.0
```

### If build fails with package errors

```bash
cd backend
dotnet clean
rm -rf */bin */obj */*/bin */*/obj
dotnet restore
dotnet build
```

---

## Success Criteria

- ✅ dotnet-ef tool version 9.0.0
- ✅ PostgreSQL container running and healthy
- ✅ 6 tables created in database
- ✅ Solution builds with 0 errors, 0 warnings
- ✅ API starts successfully
- ✅ Health endpoint returns 200 OK

---

**Last Updated:** 2026-02-06
