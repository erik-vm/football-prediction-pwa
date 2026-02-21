# Football Prediction PWA - Deployment Guide

**Version:** 1.0
**Date:** February 21, 2026
**Status:** Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Recommended Platforms](#recommended-platforms)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

**Backend:**
- .NET 9.0 Runtime (or SDK for building)
- PostgreSQL 14+ database
- Linux/Windows/macOS server

**Frontend:**
- Node.js 22+ (for building only)
- Static file hosting service

**Development Tools (Optional):**
- Git (for version control)
- Docker (for containerized deployment)

### Required Accounts/Services

- PostgreSQL database provider
- Static hosting provider (for frontend)
- Backend hosting provider (for API)
- Domain name (optional but recommended)
- SSL certificate provider (Let's Encrypt recommended)

---

## Environment Variables

### Backend Environment Variables

Create a `.env` file or configure the following environment variables in your hosting platform:

#### Required Variables

```bash
# Database Connection
ConnectionStrings__DefaultConnection=Host=your-db-host;Database=your-db-name;Username=your-db-user;Password=your-db-password;Port=5432

# JWT Settings
JwtSettings__SecretKey=your-super-secret-key-at-least-32-characters-long
JwtSettings__Issuer=FootballPredictionAPI
JwtSettings__Audience=FootballPredictionClient
JwtSettings__ExpirationMinutes=60
JwtSettings__RefreshTokenExpirationDays=7

# CORS Settings (Update with your frontend domain)
Cors__AllowedOrigins__0=https://your-frontend-domain.com
Cors__AllowedOrigins__1=http://localhost:4200

# Application Settings
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

#### Optional Variables

```bash
# Logging
Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft.AspNetCore=Warning

# Rate Limiting (if implemented)
RateLimit__RequestsPerMinute=60
```

### Frontend Environment Variables

Update `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

---

## Backend Deployment

### Option 1: Standard Deployment

#### 1. Build the Application

```bash
cd backend/src/FootballPrediction.Api
dotnet publish -c Release -o ./publish
```

#### 2. Transfer Files

Upload the contents of the `publish` folder to your server:

```bash
scp -r ./publish/* user@your-server:/var/www/football-prediction-api
```

#### 3. Configure Environment Variables

On your server, create environment variables or an `appsettings.Production.json` file:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-db-host;Database=football_prediction;Username=your-user;Password=your-password"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-at-least-32-characters-long",
    "Issuer": "FootballPredictionAPI",
    "Audience": "FootballPredictionClient",
    "ExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["https://your-frontend-domain.com"]
  }
}
```

#### 4. Run Database Migrations

```bash
cd /var/www/football-prediction-api
dotnet FootballPrediction.Api.dll --migrate
```

Or manually run migrations:

```bash
cd backend/src/FootballPrediction.Infrastructure
dotnet ef database update --project ../FootballPrediction.Api
```

#### 5. Start the Application

**Using systemd (Linux):**

Create `/etc/systemd/system/football-prediction-api.service`:

```ini
[Unit]
Description=Football Prediction API
After=network.target

[Service]
WorkingDirectory=/var/www/football-prediction-api
ExecStart=/usr/bin/dotnet /var/www/football-prediction-api/FootballPrediction.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=football-prediction-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable football-prediction-api
sudo systemctl start football-prediction-api
sudo systemctl status football-prediction-api
```

**Using PM2 (Alternative):**

```bash
pm2 start "dotnet FootballPrediction.Api.dll" --name football-prediction-api
pm2 save
pm2 startup
```

#### 6. Configure Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/football-prediction-api`:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/football-prediction-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d api.your-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj files
COPY src/FootballPrediction.Domain/*.csproj ./src/FootballPrediction.Domain/
COPY src/FootballPrediction.Application/*.csproj ./src/FootballPrediction.Application/
COPY src/FootballPrediction.Infrastructure/*.csproj ./src/FootballPrediction.Infrastructure/
COPY src/FootballPrediction.Api/*.csproj ./src/FootballPrediction.Api/

# Restore dependencies
RUN dotnet restore src/FootballPrediction.Api/FootballPrediction.Api.csproj

# Copy everything else
COPY . .

# Build and publish
WORKDIR /app/src/FootballPrediction.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "FootballPrediction.Api.dll"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: football_prediction
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=db;Database=football_prediction;Username=postgres;Password=${DB_PASSWORD}
      - JwtSettings__SecretKey=${JWT_SECRET_KEY}
      - JwtSettings__Issuer=FootballPredictionAPI
      - JwtSettings__Audience=FootballPredictionClient
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:
```

#### 3. Deploy with Docker

```bash
# Set environment variables
export DB_PASSWORD=your-secure-password
export JWT_SECRET_KEY=your-super-secret-key-at-least-32-characters-long

# Build and run
docker-compose up -d

# Run migrations
docker-compose exec api dotnet ef database update
```

---

## Frontend Deployment

### 1. Build for Production

```bash
cd frontend
npm install
ng build --configuration production
```

Build output location: `frontend/dist/frontend/browser`

### 2. Deploy to Static Hosting

#### Option A: Vercel

```bash
npm install -g vercel
cd frontend/dist/frontend/browser
vercel --prod
```

#### Option B: Netlify

```bash
npm install -g netlify-cli
cd frontend/dist/frontend/browser
netlify deploy --prod --dir=.
```

#### Option C: Azure Static Web Apps

```bash
az staticwebapp create \
  --name football-prediction \
  --resource-group my-resource-group \
  --source ./frontend/dist/frontend/browser \
  --location "Central US" \
  --app-location "/" \
  --output-location "browser"
```

#### Option D: nginx (Self-hosted)

```bash
# Copy build files
sudo cp -r frontend/dist/frontend/browser/* /var/www/football-prediction

# Create nginx config
sudo nano /etc/nginx/sites-available/football-prediction
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/football-prediction;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/football-prediction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Configure Service Worker (PWA)

The application is configured as a PWA. Ensure:
- Files are served over HTTPS
- `ngsw.json` and `ngsw-worker.js` are accessible
- Proper cache headers are set

---

## Database Setup

### 1. Create PostgreSQL Database

#### On managed service (Railway, Supabase, etc.):
- Create a new PostgreSQL database through their UI
- Note the connection string

#### On self-hosted server:

```bash
sudo -u postgres psql

CREATE DATABASE football_prediction;
CREATE USER football_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE football_prediction TO football_user;
\q
```

### 2. Run Migrations

```bash
cd backend/src/FootballPrediction.Infrastructure
dotnet ef database update --project ../FootballPrediction.Api
```

Or use the published DLL:

```bash
cd /path/to/publish
dotnet FootballPrediction.Api.dll --migrate
```

### 3. Seed Initial Data

Create admin user manually:

```sql
-- Connect to database
psql -h your-host -U football_user -d football_prediction

-- Create admin user (password: Admin123!)
INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role", "CreatedAt", "UpdatedAt")
VALUES (
  'admin',
  'admin@example.com',
  '$2a$11$XH8BW/YHEqT5YwV9bQ9iyO8z4C4qF7KqBN8xJ9nVVZzXJxXPXKiHe',
  0,
  NOW(),
  NOW()
);
```

**Note:** The password hash above is for `Admin123!`. Change this in production!

To generate a new password hash:

```bash
dotnet run --project backend/src/FootballPrediction.Api hash-password YourNewPassword
```

### 4. Backup Strategy

Setup automated backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-football-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/football-prediction"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U football_user -d football_prediction | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-football-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-football-db.sh" | crontab -
```

---

## Recommended Platforms

### Backend Hosting

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| **Railway** | Easy deployment, built-in PostgreSQL, automatic SSL | Limited free tier | $5-20/mo |
| **Render** | Simple setup, auto-deploy from Git, free SSL | Cold starts on free tier | Free - $25/mo |
| **Azure App Service** | Enterprise-grade, excellent .NET support | More complex setup | $13-200/mo |
| **DigitalOcean** | Full control, droplets + managed DB | Manual setup required | $12-50/mo |
| **Heroku** | Very easy deployment | Expensive for production | $7-50/mo |

**Recommendation:** Railway for simplicity, Azure for enterprise

### Frontend Hosting

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| **Vercel** | Automatic deployments, CDN, excellent DX | Build minute limits | Free - $20/mo |
| **Netlify** | Great Angular support, form handling | Limited build minutes | Free - $19/mo |
| **Azure Static Web Apps** | Integrated with Azure backend, serverless | Azure-specific | Free - $9/mo |
| **Cloudflare Pages** | Free unlimited builds, fast CDN | Less features | Free |

**Recommendation:** Vercel or Netlify for ease, Cloudflare Pages for cost

### Database Hosting

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| **Supabase** | PostgreSQL, generous free tier, backups | Not as mature as others | Free - $25/mo |
| **Railway** | Bundled with backend, easy setup | Database cost adds up | $5-20/mo |
| **Azure Database** | Enterprise-grade, high availability | Complex pricing | $15-100/mo |
| **DigitalOcean Managed DB** | Simple, reliable, good performance | No free tier | $15-50/mo |

**Recommendation:** Supabase for development, DigitalOcean for production

---

## Post-Deployment Verification

### 1. Health Check

Test the API health endpoint:

```bash
curl https://api.your-domain.com/health
# Expected: HTTP 200, "Healthy"
```

### 2. Authentication Test

```bash
# Register a test user
curl -X POST https://api.your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Login
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "Test123!"
  }'
```

### 3. Frontend Verification

- Open `https://your-domain.com`
- Verify login page loads
- Test user registration
- Test user login
- Navigate to predictions page
- Check responsive design on mobile

### 4. Database Verification

```bash
psql -h your-db-host -U your-user -d football_prediction

SELECT COUNT(*) FROM "Users";
SELECT * FROM "__EFMigrationsHistory";
```

### 5. SSL Verification

```bash
curl -I https://api.your-domain.com
curl -I https://your-domain.com
# Both should return HTTP 200 and valid SSL certificate
```

### 6. CORS Verification

Open browser console on your frontend domain and check for CORS errors when making API calls.

---

## Monitoring and Maintenance

### 1. Application Monitoring

**Setup Application Insights (Azure):**

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

Add to `Program.cs`:

```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

**Alternative: Sentry**

```bash
dotnet add package Sentry.AspNetCore
```

### 2. Log Management

**Structured Logging with Serilog:**

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
```

Configure in `Program.cs`:

```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/football-prediction-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();
```

### 3. Performance Monitoring

Monitor these metrics:
- API response times
- Database query performance
- Frontend load times (Lighthouse)
- Error rates
- Active users

### 4. Regular Maintenance Tasks

**Weekly:**
- Review error logs
- Check disk space
- Monitor database size
- Review user feedback

**Monthly:**
- Update dependencies
- Review security patches
- Analyze performance metrics
- Database optimization (VACUUM, REINDEX)

**Quarterly:**
- Security audit
- Load testing
- Backup restoration test
- Review and update documentation

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `Npgsql.NpgsqlException: Connection refused`

**Solution:**
- Verify PostgreSQL is running: `systemctl status postgresql`
- Check connection string is correct
- Verify firewall allows connections on port 5432
- Check PostgreSQL `pg_hba.conf` for access rules

#### 2. JWT Token Errors

**Error:** `401 Unauthorized` on protected endpoints

**Solution:**
- Verify JWT secret key is set and matches between environments
- Check token expiration settings
- Ensure token is being sent in Authorization header: `Bearer {token}`
- Verify CORS is configured correctly

#### 3. Migration Errors

**Error:** `Npgsql.PostgresException: relation does not exist`

**Solution:**
```bash
# Reset database (WARNING: destroys data)
dotnet ef database drop --force
dotnet ef database update

# Or manually run migrations
dotnet ef migrations script > migration.sql
psql -h host -U user -d database -f migration.sql
```

#### 4. CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Verify frontend domain is in `Cors:AllowedOrigins`
- Check CORS middleware is configured correctly
- Ensure credentials are allowed if needed

#### 5. Frontend Not Loading

**Error:** Blank page or 404 errors on refresh

**Solution:**
- Verify `try_files $uri $uri/ /index.html;` in nginx
- Check all files were copied to web root
- Verify base href in index.html: `<base href="/">`

#### 6. PWA Not Installing

**Error:** Install prompt doesn't appear

**Solution:**
- Verify site is served over HTTPS
- Check `manifest.json` is accessible
- Ensure service worker is registered
- Use Chrome DevTools > Application > Manifest to debug

#### 7. High Memory Usage

**Solution:**
```bash
# Check .NET memory usage
dotnet-counters monitor -p $(pidof dotnet)

# Adjust memory limits in systemd service
[Service]
MemoryLimit=512M
```

#### 8. Slow API Performance

**Solution:**
- Enable database query logging
- Add database indexes
- Implement caching (Redis)
- Use async/await properly
- Enable response compression

---

## Emergency Procedures

### Rollback Deployment

**Backend:**
```bash
# Stop service
sudo systemctl stop football-prediction-api

# Restore previous version
sudo cp -r /var/www/football-prediction-api.backup/* /var/www/football-prediction-api/

# Restart service
sudo systemctl start football-prediction-api
```

**Frontend:**
```bash
# Deploy previous build
vercel rollback
# or
netlify rollback
```

**Database:**
```bash
# Restore from backup
gunzip -c /var/backups/football-prediction/backup_20260220_020000.sql.gz | psql -h host -U user -d database
```

### Contact and Support

- **Repository:** https://github.com/your-repo/football-prediction-pwa
- **Issues:** https://github.com/your-repo/football-prediction-pwa/issues
- **Documentation:** https://your-domain.com/docs

---

**Last Updated:** February 21, 2026
**Version:** 1.0.0
**Status:** Production Ready
