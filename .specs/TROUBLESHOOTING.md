# Troubleshooting Guide

## Critical Issues Encountered

### Issue 1: PostgreSQL Port Conflict (Multiple Instances)

**Symptoms:**
- EF Core migrations appear to apply successfully
- Database schema verified as correct when checked directly
- Runtime errors: "column [ColumnName] does not exist"
- Error persists despite clean builds, Docker restarts, and fresh migrations

**Root Cause:**
Multiple PostgreSQL instances listening on the same port (typically 5432):
- Docker PostgreSQL container (intended)
- Native Windows PostgreSQL service (interference)

When connection string uses `localhost:5432`, the application may connect to the wrong instance.

**Diagnosis Steps:**
```bash
# Check what's listening on PostgreSQL port
netstat -ano | findstr :5432

# Identify processes
tasklist | findstr "[PID]"

# Expected output showing conflict:
# TCP    0.0.0.0:5432    ...    LISTENING    [PID1]  # Docker
# TCP    0.0.0.0:5432    ...    LISTENING    [PID2]  # Windows service
```

**Solution:**
1. Change Docker PostgreSQL port mapping to avoid conflict:
   ```yaml
   # docker-compose.yml
   ports:
     - "5433:5432"  # Changed from "5432:5432"
   ```

2. Update connection string in appsettings.json:
   ```json
   "DefaultConnection": "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres"
   ```

3. Restart Docker and apply migrations:
   ```bash
   docker-compose down -v
   docker-compose up -d
   sleep 5
   dotnet ef database update --startup-project ../FootballPrediction.Api
   ```

**Alternative Solutions:**
- Stop the Windows PostgreSQL service (requires admin rights)
- Use different database name to avoid confusion
- Use Docker container name instead of localhost in connection string

**Prevention:**
- Always check for port conflicts before setting up Docker services
- Document which ports are in use
- Use non-standard ports for Docker services to avoid conflicts

---

### Issue 2: EF Core Design-Time vs Runtime Configuration

**Symptoms:**
- `dotnet ef database update` connects to different port than appsettings.json specifies
- Migrations apply but to wrong database

**Root Cause:**
EF Core design-time tools may cache or read configuration differently than runtime.

**Solution:**
Pass connection string explicitly:
```bash
dotnet ef database update --connection "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres"
```

---

### Issue 3: Git Bash Path Translation on Windows

**Symptoms:**
- Commands like `taskkill /F /PID 1234` fail with "Invalid argument/option - 'F:/'"
- Git Bash incorrectly interprets `/F` as a path

**Solution:**
Use double slashes for Windows command flags in Git Bash:
```bash
# Wrong
taskkill /F /PID 1234

# Correct in Git Bash
taskkill //F //PID 1234
```

---

## Common PostgreSQL Issues

### Docker Container Not Starting

**Check container status:**
```bash
docker ps -a
docker logs football_prediction_db
```

**Restart container:**
```bash
docker-compose restart
```

**Full recreate:**
```bash
docker-compose down -v
docker-compose up -d
```

### Database Connection Refused

**Verify PostgreSQL is running:**
```bash
docker exec football_prediction_db pg_isready -U postgres
```

**Check container network:**
```bash
docker inspect football_prediction_db | grep IPAddress
```

**Test connection:**
```bash
docker exec football_prediction_db psql -U postgres -c "SELECT version();"
```

---

## EF Core Migration Issues

### Migration Already Applied but Tables Missing

**Check migration history:**
```bash
docker exec football_prediction_db psql -U postgres -d football_prediction -c "SELECT * FROM \"__EFMigrationsHistory\";"
```

**List actual tables:**
```bash
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\dt"
```

**Force reapply (dangerous - drops all data):**
```bash
dotnet ef database drop --force
dotnet ef database update
```

### Column Exists in Database but EF Core Says It Doesn't

This is **Issue 1** - multiple PostgreSQL instances. See above.

**Quick verification:**
```bash
# Check Docker database
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\d \"Users\""

# Check which port EF Core is connecting to
dotnet ef database update --verbose | grep "Opening connection"
```

---

## Build and Runtime Issues

### Stuck dotnet.exe Processes

**Find processes:**
```bash
tasklist | findstr dotnet
```

**Kill processes (Git Bash):**
```bash
taskkill //F //IM dotnet.exe
# Or specific PID
taskkill //F //PID [PID]
```

### Port Already in Use (API)

**Find what's using the port:**
```bash
netstat -ano | findstr :5206
```

**Kill the process:**
```bash
taskkill //F //PID [PID]
```

---

## Debugging Tips

### Enable Detailed EF Core Logging

In Program.cs:
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)
    .EnableSensitiveDataLogging()
    .EnableDetailedErrors()
    .LogTo(Console.WriteLine, LogLevel.Information));
```

### Verify Database Schema Matches Model

```bash
# Check table structure
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\d \"TableName\""

# Check all indexes
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\di"

# Check foreign keys
docker exec football_prediction_db psql -U postgres -d football_prediction -c "\d+ \"TableName\""
```

### Test Direct Database Connection

```bash
# From inside container
docker exec -it football_prediction_db psql -U postgres -d football_prediction

# Test INSERT (verify columns exist)
INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "Role", "CreatedAt", "RefreshToken", "RefreshTokenExpiry")
VALUES (gen_random_uuid(), 'test', 'test@test.com', 'hash', 'USER', now(), 'token', now() + interval '7 days');
```

---

## Prevention Checklist

Before starting development:
- [ ] Check for port conflicts (5432, 5433, 5206, 4200, etc.)
- [ ] Verify only one PostgreSQL instance is running
- [ ] Test Docker container can start and accept connections
- [ ] Verify connection string points to correct instance
- [ ] Run migrations and verify they apply to intended database
- [ ] Test API can connect and perform basic operations

When encountering database errors:
- [ ] Verify which PostgreSQL instance is being used
- [ ] Check migration history matches expected state
- [ ] Verify table schema matches entity model
- [ ] Enable detailed EF Core logging
- [ ] Test with direct psql connection
