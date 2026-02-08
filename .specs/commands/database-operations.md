# Database Operations Commands

**Purpose:** Common database operations for development
**Used by:** Developer Agent, Database Administrator Agent
**When:** Schema changes, data verification, troubleshooting

---

## Creating Migrations

```bash
# From Infrastructure project
cd backend/src/FootballPrediction.Infrastructure

# Create new migration
dotnet ef migrations add <MigrationName>

# Example:
dotnet ef migrations add AddUserProfilePicture

# Remove last migration (if not applied yet)
dotnet ef migrations remove
```

---

## Applying Migrations

### Method 1: SQL Script (Recommended)

```bash
cd backend/src/FootballPrediction.Infrastructure

# Generate SQL script
dotnet ef migrations script --output migration.sql

# Review the SQL (optional)
cat migration.sql

# Apply to database
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql

# Verify
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'
```

### Method 2: EF Direct Update

**IMPORTANT:** Always use explicit `--connection` parameter to ensure EF Core connects to the correct database instance.

```bash
cd backend/src/FootballPrediction.Infrastructure

# Apply all pending migrations (ALWAYS use explicit connection string)
dotnet ef database update --connection "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres" --startup-project ../FootballPrediction.Api

# Apply specific migration
dotnet ef database update <MigrationName> --connection "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres" --startup-project ../FootballPrediction.Api

# Rollback to specific migration
dotnet ef database update <PreviousMigrationName> --connection "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres" --startup-project ../FootballPrediction.Api
```

**Why Explicit Connection String?**
- EF Core design-time tools may cache or ignore appsettings.json
- Prevents connection to wrong database instance (e.g., Windows PostgreSQL service vs Docker container)
- Ensures repeatability and eliminates ambiguity

---

## Database Queries

### List all tables

```bash
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'
```

### Describe table structure

```bash
# View Users table
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\d "Users"'

# View Predictions table
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\d "Predictions"'
```

### View table data

```bash
# View all users
docker exec football_prediction_db psql -U postgres -d football_prediction -c 'SELECT * FROM "Users";'

# View predictions with user info
docker exec football_prediction_db psql -U postgres -d football_prediction -c '
SELECT u."Username", p."HomeScore", p."AwayScore", p."PointsEarned"
FROM "Predictions" p
JOIN "Users" u ON p."UserId" = u."Id"
LIMIT 10;'
```

### Check migration history

```bash
docker exec football_prediction_db psql -U postgres -d football_prediction -c 'SELECT * FROM "__EFMigrationsHistory" ORDER BY "MigrationId";'
```

---

## Database Reset

### Soft reset (keep container, clear data)

```bash
cd backend

# Drop and recreate database
docker exec football_prediction_db psql -U postgres -c 'DROP DATABASE IF EXISTS football_prediction;'
docker exec football_prediction_db psql -U postgres -c 'CREATE DATABASE football_prediction;'

# Reapply migrations
cd src/FootballPrediction.Infrastructure
dotnet ef migrations script --output migration.sql
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql
```

### Hard reset (recreate container)

```bash
cd backend

# Stop and remove container + volume
docker-compose down
docker volume rm backend_postgres_data

# Recreate
docker-compose up -d
sleep 5  # Wait for ready

# Apply migrations
cd src/FootballPrediction.Infrastructure
dotnet ef migrations script --output migration.sql
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql
```

---

## Seeding Test Data

```bash
# Create seed data script
cat > backend/seed-data.sql << 'EOF'
-- Create test user
INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "Role", "CreatedAt")
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'testuser',
  'test@example.com',
  '$2a$11$hashedpassword',  -- Replace with actual BCrypt hash
  'USER',
  NOW()
);

-- Create test tournament
INSERT INTO "Tournaments" ("Id", "Name", "Season", "StartDate", "EndDate", "IsActive")
VALUES (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Champions League',
  '2024/25',
  '2024-09-17',
  '2025-05-31',
  true
);
EOF

# Apply seed data
docker exec -i football_prediction_db psql -U postgres -d football_prediction < backend/seed-data.sql

# Verify
docker exec football_prediction_db psql -U postgres -d football_prediction -c 'SELECT "Username", "Email" FROM "Users";'
```

---

## Backup & Restore

### Backup database

```bash
# Backup to file
docker exec football_prediction_db pg_dump -U postgres football_prediction > backup-$(date +%Y%m%d).sql

# Verify backup file
ls -lh backup-*.sql
```

### Restore from backup

```bash
# Restore from backup file
docker exec -i football_prediction_db psql -U postgres -d football_prediction < backup-20260206.sql

# Verify data
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'
```

---

## Database Monitoring

### Check database size

```bash
docker exec football_prediction_db psql -U postgres -d football_prediction -c "
SELECT pg_size_pretty(pg_database_size('football_prediction')) AS size;"
```

### Check table sizes

```bash
docker exec football_prediction_db psql -U postgres -d football_prediction -c "
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Check active connections

```bash
docker exec football_prediction_db psql -U postgres -c "
SELECT datname, count(*)
FROM pg_stat_activity
WHERE datname = 'football_prediction'
GROUP BY datname;"
```

---

## Troubleshooting

### PostgreSQL Port Conflict (Multiple Instances)

**Symptoms:**
- EF Core error: "column [ColumnName] does not exist"
- Database schema appears correct when checked via `psql`
- Migrations show as applied in `__EFMigrationsHistory`
- Problem persists despite clean builds and fresh migrations

**Diagnosis:**
```bash
# Check for multiple PostgreSQL instances on same port
netstat -ano | findstr :5432
netstat -ano | findstr :5433

# If you see multiple entries for same port, you have a conflict
# Example of conflict:
# TCP    0.0.0.0:5432    LISTENING    19092  # Docker
# TCP    0.0.0.0:5432    LISTENING    7332   # Windows service
```

**Solution:**
1. Use different port for Docker (5433 instead of 5432)
2. Update `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"
   ```
3. Update `appsettings.json` connection string to use Port=5433
4. Restart Docker and apply migrations with explicit connection string

**Prevention:**
- Always use non-default ports for Docker services
- Run port conflict check before starting development
- See `.specs/TROUBLESHOOTING.md` for detailed guidance

### Can't connect to database

```bash
# Check container status
docker ps | grep football_prediction_db

# Check logs
docker logs football_prediction_db | tail -50

# Restart container
docker restart football_prediction_db
sleep 5

# Test connection
docker exec -it football_prediction_db psql -U postgres -d football_prediction -c 'SELECT 1;'
```

### Migration state corrupted

```bash
# View current migration state
docker exec football_prediction_db psql -U postgres -d football_prediction -c 'SELECT * FROM "__EFMigrationsHistory";'

# Clear migration history (DANGEROUS - only if state is corrupted)
docker exec football_prediction_db psql -U postgres -d football_prediction -c 'TRUNCATE TABLE "__EFMigrationsHistory";'

# Reapply all migrations
cd backend/src/FootballPrediction.Infrastructure
dotnet ef migrations script --output migration.sql
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql
```

### Check for schema drift

```bash
# Generate SQL script for pending migrations
cd backend/src/FootballPrediction.Infrastructure
dotnet ef migrations script --idempotent --output check-drift.sql

# Review what would be applied
cat check-drift.sql

# If empty, no drift. If has SQL, there's drift.
```

---

**Last Updated:** 2026-02-06
