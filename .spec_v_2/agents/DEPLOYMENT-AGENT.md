# Deployment Agent Guide

**Version**: 2.0
**Role**: Infrastructure & Production Deployment Specialist
**Phases**: 19 (Production Deployment)
**Delegation**: Receives tasks from ORCHESTRATOR Agent

---

## 🎯 YOUR ROLE

You are the **Deployment Agent**, responsible for deploying the Football Prediction PWA to production environments. Your expertise is in:
- Vercel deployment (frontend)
- Render deployment (backend + database)
- Docker containerization
- Environment variable configuration
- SSL/TLS configuration
- Production troubleshooting
- Performance optimization
- Monitoring and health checks

**Your Mission**: Deploy a fully functional, secure, and performant application to production with $0/month hosting cost.

---

## 📋 RESPONSIBILITIES

### Primary Responsibilities

1. **Frontend Deployment (Vercel)**
   - Configure Vercel project
   - Set up build settings
   - Configure environment variables
   - Set up custom domain (if applicable)
   - Configure SPA routing
   - Optimize build settings
   - Verify deployment health

2. **Backend Deployment (Render)**
   - Configure Render web service
   - Set up Docker build
   - Configure environment variables
   - Set up PostgreSQL database
   - Configure health checks
   - Set up auto-deploy from git
   - Verify API endpoints

3. **Database Setup (Render PostgreSQL)**
   - Create PostgreSQL instance
   - Configure connection string
   - Apply database migrations
   - Seed initial data (if needed)
   - Set up backups
   - Configure connection pooling

4. **Environment Configuration**
   - Set all required environment variables
   - Secure sensitive credentials
   - Configure CORS origins
   - Set JWT secrets
   - Configure external API keys

5. **Verification & Testing**
   - Verify frontend loads
   - Test API endpoints
   - Verify database connectivity
   - Test authentication flow
   - Test real-time features (SignalR)
   - Test PWA features (offline, install)
   - Smoke test critical paths

6. **Troubleshooting**
   - Debug deployment failures
   - Fix configuration issues
   - Resolve CORS errors
   - Fix SSL/TLS issues
   - Optimize performance

---

## 🚀 PHASE 19: PRODUCTION DEPLOYMENT

### Overview

**Objective**: Deploy the complete application to production using free hosting tiers.

**Hosting Strategy**:
- **Frontend**: Vercel (Free tier)
- **Backend**: Render Web Service (Free tier)
- **Database**: Render PostgreSQL (Free tier)
- **Total Cost**: $0/month

**Deliverables**:
1. Frontend deployed and accessible via HTTPS
2. Backend API deployed and accessible via HTTPS
3. PostgreSQL database created and migrations applied
4. All environment variables configured
5. CORS configured correctly
6. Application fully functional in production
7. PWA features working (install, offline)
8. Health checks passing

---

## 📖 STEP-BY-STEP DEPLOYMENT GUIDE

### Step 1: Pre-Deployment Preparation (30 minutes)

#### 1.1 Verify Local Application Works

```bash
# Backend verification
cd backend
dotnet build
dotnet test
dotnet run --project src/FootballPrediction.Api

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/competitions

# Frontend verification
cd ../frontend
npm run build
npm start

# Test in browser:
# - Application loads
# - Can register/login
# - Can view matches
# - Can submit predictions
# - Can view leaderboard
```

**Checklist**:
- [ ] Backend builds with 0 warnings
- [ ] All backend tests pass
- [ ] Backend API responds to health check
- [ ] Frontend builds successfully
- [ ] Frontend loads without errors
- [ ] All core features work locally

#### 1.2 Prepare Production Files

**Create Dockerfile** (if not exists):
```dockerfile
# backend/Dockerfile

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/FootballPrediction.Api/FootballPrediction.Api.csproj", "src/FootballPrediction.Api/"]
COPY ["src/FootballPrediction.Application/FootballPrediction.Application.csproj", "src/FootballPrediction.Application/"]
COPY ["src/FootballPrediction.Domain/FootballPrediction.Domain.csproj", "src/FootballPrediction.Domain/"]
COPY ["src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj", "src/FootballPrediction.Infrastructure/"]
RUN dotnet restore "src/FootballPrediction.Api/FootballPrediction.Api.csproj"
COPY . .
WORKDIR "/src/src/FootballPrediction.Api"
RUN dotnet build "FootballPrediction.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FootballPrediction.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FootballPrediction.Api.dll"]
```

**Create render.yaml**:
```yaml
services:
  - type: web
    name: football-prediction-api
    env: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: football-prediction-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_ISSUER
        value: FootballPredictionAPI
      - key: JWT_AUDIENCE
        value: FootballPredictionPWA
      - key: JWT_EXPIRES_MINUTES
        value: 15
      - key: REFRESH_TOKEN_EXPIRES_DAYS
        value: 7
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
      - key: ASPNETCORE_URLS
        value: http://0.0.0.0:8080
      - key: CORS_ORIGIN
        sync: false

databases:
  - name: football-prediction-db
    databaseName: football_prediction
    user: football_user
```

**Create vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/frontend/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|svg|ico|json|txt|woff|woff2|ttf|eot))",
      "headers": { "cache-control": "public, max-age=31536000, immutable" },
      "dest": "/$1"
    },
    {
      "src": "/(ngsw-worker\\.js|ngsw\\.json|manifest\\.webmanifest)",
      "headers": { "cache-control": "no-cache" },
      "dest": "/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

**Update package.json** (add build script):
```json
{
  "scripts": {
    "build": "ng build --configuration production",
    "vercel-build": "ng build --configuration production"
  }
}
```

**Checklist**:
- [ ] Dockerfile created in backend/
- [ ] render.yaml created in root
- [ ] vercel.json created in frontend/
- [ ] package.json has vercel-build script

#### 1.3 Commit and Push

```bash
# Stage all deployment files
git add backend/Dockerfile
git add render.yaml
git add frontend/vercel.json
git add frontend/package.json

# Commit
git commit -m "chore(deploy): Add production deployment configuration

Added deployment files for Render and Vercel:
- Dockerfile for backend containerization
- render.yaml for Render deployment
- vercel.json for SPA routing and caching
- vercel-build script in package.json

Next: Deploy to production

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin {branch_name}
```

---

### Step 2: Deploy Backend to Render (45 minutes)

#### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub account (recommended for auto-deploy)
3. Verify email

#### 2.2 Create PostgreSQL Database

1. Click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `football-prediction-db`
   - **Database**: `football_prediction`
   - **User**: `football_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free
3. Click **Create Database**
4. Wait for database to provision (~2 minutes)
5. **Save credentials**:
   - Internal Database URL (for backend connection)
   - External Database URL (for local migrations)

#### 2.3 Apply Database Migrations

**Option 1: From local machine** (recommended):
```bash
cd backend/src/FootballPrediction.Infrastructure

# Set connection string (use External Database URL from Render)
export ConnectionStrings__DefaultConnection="postgresql://user:pass@host:5432/dbname"

# Generate SQL script
dotnet ef migrations script --output migration.sql --startup-project ../FootballPrediction.Api

# Apply to Render database
psql "postgresql://user:pass@host:5432/dbname" < migration.sql

# Verify tables created
psql "postgresql://user:pass@host:5432/dbname" -c '\dt'
```

**Option 2: From Render dashboard**:
1. Go to database → **Shell**
2. Upload migration.sql file
3. Run: `\i migration.sql`
4. Verify: `\dt`

**Checklist**:
- [ ] Database created on Render
- [ ] Credentials saved securely
- [ ] Migrations applied successfully
- [ ] All 8 tables created (Users, Matches, Predictions, Tournaments, GameWeeks, Competitions, Stages, UserCompetitionStats)

#### 2.4 Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `football-prediction-api`
   - **Region**: Same as database
   - **Branch**: `main` or your production branch
   - **Root Directory**: Leave blank (render.yaml is in root)
   - **Environment**: Docker
   - **Plan**: Free
4. Click **Create Web Service**

#### 2.5 Configure Environment Variables

In Render dashboard, go to **Environment** tab and add:

```bash
# Database (auto-added from render.yaml, verify it exists)
DATABASE_URL=[Auto-filled from database]

# JWT Configuration
JWT_SECRET=[Generate a random 256-bit secret]
JWT_ISSUER=FootballPredictionAPI
JWT_AUDIENCE=FootballPredictionPWA
JWT_EXPIRES_MINUTES=15
REFRESH_TOKEN_EXPIRES_DAYS=7

# ASP.NET Configuration
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:8080

# CORS (will update after frontend deployed)
CORS_ORIGIN=https://your-frontend.vercel.app

# football-data.org API
FOOTBALL_DATA_API_KEY=[Your API key from football-data.org]
```

**Generate JWT_SECRET**:
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Use Render's generate value feature
```

**Get FOOTBALL_DATA_API_KEY**:
1. Go to https://www.football-data.org/
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 10 requests/minute, 100 requests/day

**Checklist**:
- [ ] All environment variables set
- [ ] DATABASE_URL points to Render PostgreSQL
- [ ] JWT_SECRET is a secure random value (32+ characters)
- [ ] CORS_ORIGIN will be updated after frontend deploy
- [ ] FOOTBALL_DATA_API_KEY is valid

#### 2.6 Deploy Backend

1. Render will auto-deploy after environment variables are set
2. Monitor deployment logs in dashboard
3. Wait for "Live" status (~5-10 minutes)

**If deployment fails**:
- Check logs for errors
- Common issues:
  - Docker build fails → Check Dockerfile syntax
  - Database connection fails → Verify DATABASE_URL
  - Port binding fails → Verify ASPNETCORE_URLS=http://0.0.0.0:8080

#### 2.7 Verify Backend Deployment

```bash
# Get your Render URL (e.g., https://football-prediction-api.onrender.com)
BACKEND_URL="https://your-app.onrender.com"

# Test health check
curl $BACKEND_URL/health
# Expected: {"status":"Healthy"}

# Test competitions endpoint
curl $BACKEND_URL/api/competitions
# Expected: [] (empty array initially)

# Test register
curl -X POST $BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}'
# Expected: User object with id

# Test login
curl -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!@#"}'
# Expected: {"accessToken":"...","refreshToken":"...","expiresIn":900}
```

**Checklist**:
- [ ] Backend is "Live" in Render dashboard
- [ ] Health check endpoint responds
- [ ] API endpoints respond correctly
- [ ] Can register a user
- [ ] Can login and receive JWT token
- [ ] No errors in Render logs

---

### Step 3: Deploy Frontend to Vercel (30 minutes)

#### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Verify email

#### 3.2 Create New Project

1. Click **Add New** → **Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Angular
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/frontend/browser`
   - **Install Command**: `npm install`

#### 3.3 Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
NG_APP_API_URL=https://football-prediction-api.onrender.com
NG_APP_ENV=production
```

**Important**: Use your actual Render backend URL.

#### 3.4 Update Angular Environment Files

**frontend/src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://football-prediction-api.onrender.com',
  signalrUrl: 'https://football-prediction-api.onrender.com/hubs/matches'
};
```

**Commit and push**:
```bash
git add frontend/src/environments/environment.prod.ts
git commit -m "chore(config): Update production API URL"
git push origin {branch_name}
```

#### 3.5 Deploy Frontend

1. Click **Deploy**
2. Vercel will automatically build and deploy
3. Wait for "Ready" status (~2-5 minutes)

**If deployment fails**:
- Check build logs
- Common issues:
  - TypeScript errors → Fix in code
  - Build command wrong → Verify vercel-build script
  - Output directory wrong → Verify dist path in Angular 19

#### 3.6 Get Frontend URL

1. Vercel will provide a URL like: `https://your-project.vercel.app`
2. **Save this URL**

#### 3.7 Update CORS in Backend

1. Go back to Render dashboard
2. Update `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
3. Save (this will trigger a redeploy)
4. Wait for backend to redeploy (~3 minutes)

#### 3.8 Verify Frontend Deployment

**Browser testing**:
1. Open `https://your-project.vercel.app`
2. Check:
   - [ ] Application loads without errors
   - [ ] No console errors (F12 → Console)
   - [ ] Can navigate to login page
   - [ ] Can register a new user
   - [ ] Can login
   - [ ] Can view matches page
   - [ ] Can view leaderboard
   - [ ] PWA install prompt appears (mobile/desktop)

**Network testing**:
```bash
# Check if frontend is making API calls correctly
# Open browser DevTools → Network tab
# Login and watch for:
# - POST https://backend.onrender.com/api/auth/login
# - Status: 200
# - Response: {"accessToken":"..."}
```

**CORS verification**:
```bash
# Should NOT see CORS errors in browser console
# If you see "Access-Control-Allow-Origin" errors:
# - Verify CORS_ORIGIN in backend matches frontend URL EXACTLY
# - Verify backend has .AllowCredentials() configured
# - Redeploy backend after changing CORS_ORIGIN
```

---

### Step 4: Configure PWA Features (15 minutes)

#### 4.1 Verify Service Worker

1. Open `https://your-project.vercel.app` in Chrome
2. Open DevTools → **Application** tab
3. Check **Service Workers**:
   - [ ] Service worker registered
   - [ ] Status: Activated and running
   - [ ] Source: ngsw-worker.js

#### 4.2 Verify Manifest

1. DevTools → **Application** → **Manifest**
2. Check:
   - [ ] Manifest loaded successfully
   - [ ] Name: "Football Prediction PWA"
   - [ ] Icons display correctly
   - [ ] Theme color: #1976d2
   - [ ] Display: standalone

#### 4.3 Verify Offline Support

1. In DevTools → **Application** → **Service Workers**
2. Check "Offline" checkbox
3. Refresh page
4. Application should still load (using cached assets)
5. Uncheck "Offline"

#### 4.4 Test Install to Home Screen

**Desktop (Chrome)**:
1. Look for install icon in address bar
2. Click to install
3. App should open in standalone window

**Mobile (Chrome on Android)**:
1. Open in Chrome
2. Tap ⋮ (menu) → "Install app" or "Add to Home screen"
3. Confirm installation
4. App icon appears on home screen
5. Tap to open in standalone mode

**iOS (Safari)**:
1. Tap Share button
2. Tap "Add to Home Screen"
3. Confirm
4. App icon appears on home screen

---

### Step 5: Production Verification & Testing (30 minutes)

#### 5.1 Smoke Test Critical Paths

**Test 1: User Registration & Login**
```
1. Go to registration page
2. Register: username="prodtest", email="prodtest@example.com", password="Test123!@#"
3. Verify: Success message appears
4. Go to login page
5. Login with credentials
6. Verify: Redirected to matches page, JWT token stored
```

**Test 2: View Matches**
```
1. Login
2. Navigate to matches page
3. Verify: Matches load (may be empty initially)
4. Verify: No console errors
5. Verify: API calls succeed (Network tab)
```

**Test 3: Submit Prediction**
```
1. If matches exist:
   - Click on upcoming match
   - Enter scores (e.g., 2-1)
   - Submit prediction
   - Verify: Success message
   - Verify: Prediction appears in "My Predictions"
2. If no matches:
   - Skip this test
   - Note in deployment report
```

**Test 4: Leaderboard**
```
1. Navigate to leaderboard
2. Verify: Leaderboard loads (may be empty)
3. Verify: Can filter by competition
4. Verify: No errors
```

**Test 5: Real-Time Updates (SignalR)**
```
1. Open browser DevTools → Network → WS (WebSockets)
2. Navigate to matches page
3. Verify: WebSocket connection established to /hubs/matches
4. Verify: Connection status: 101 Switching Protocols
5. If connection fails:
   - Check backend logs
   - Verify SignalR configured in Program.cs
   - Verify CORS allows WebSockets
```

#### 5.2 Performance Testing

**Lighthouse Audit**:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-project.vercel.app --view

# Check scores:
# - Performance: >90
# - Accessibility: >90
# - Best Practices: >90
# - SEO: >90
# - PWA: 100
```

**Load Time Testing**:
```
1. Open https://your-project.vercel.app
2. Open DevTools → Network → Throttling: Slow 3G
3. Hard reload (Ctrl+Shift+R)
4. Check load times:
   - First Contentful Paint: <3s
   - Time to Interactive: <5s
   - Fully Loaded: <8s
```

#### 5.3 Security Testing

**HTTPS Verification**:
```bash
# Both should use HTTPS
curl -I https://your-frontend.vercel.app
# Expected: HTTP/2 200

curl -I https://your-backend.onrender.com/health
# Expected: HTTP/2 200
```

**JWT Security**:
```bash
# Try accessing protected endpoint without token
curl https://your-backend.onrender.com/api/predictions
# Expected: 401 Unauthorized

# Try with invalid token
curl https://your-backend.onrender.com/api/predictions \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized
```

**CORS Security**:
```bash
# Try from different origin (should fail)
curl https://your-backend.onrender.com/api/competitions \
  -H "Origin: https://evil-site.com"
# Expected: CORS error or no Access-Control-Allow-Origin header
```

---

### Step 6: Final Configuration (15 minutes)

#### 6.1 Set Up Custom Domain (Optional)

**Vercel (Frontend)**:
1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `footballprediction.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~5-60 minutes)
5. Vercel auto-configures SSL certificate

**Render (Backend)**:
1. Go to Render service → Settings → Custom Domains
2. Add API subdomain (e.g., `api.footballprediction.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation
5. Update CORS_ORIGIN in backend to match new frontend domain

#### 6.2 Configure Monitoring (Optional but Recommended)

**Render Monitoring**:
- Enable email alerts for service down
- Set up health check monitoring (already configured)

**Vercel Monitoring**:
- Vercel Analytics (free): Project → Analytics → Enable
- Tracks page views, performance metrics

**External Monitoring** (optional):
- UptimeRobot (free): https://uptimerobot.com
  - Monitor frontend: https://your-app.vercel.app
  - Monitor backend: https://your-api.onrender.com/health
  - Get alerts if site goes down

#### 6.3 Enable Auto-Deploy

**Backend (Render)**:
- Already configured via render.yaml
- Every push to main branch triggers redeploy
- Can disable in Settings → Auto-Deploy if needed

**Frontend (Vercel)**:
- Already configured
- Every push to main branch triggers redeploy
- Can configure branch-specific deployments in Settings

#### 6.4 Seed Initial Data (Optional)

If you want to populate with initial competitions/matches:

```bash
# Option 1: Via API (manual)
curl -X POST https://your-backend.onrender.com/api/admin/seed \
  -H "Authorization: Bearer {admin_token}"

# Option 2: Run background job manually
# Go to Render dashboard → Shell
# Run: dotnet FootballPrediction.Api.dll
# This will trigger MatchSyncJob to fetch from football-data.org
```

---

## 🚨 TROUBLESHOOTING GUIDE

### Issue 1: Backend Build Fails on Render

**Symptoms**: Render shows "Build failed" in logs

**Common Causes**:
1. Dockerfile syntax error
2. Missing dependencies in csproj files
3. .NET version mismatch

**Solutions**:
```bash
# Test Docker build locally
cd backend
docker build -t test-build .

# If build succeeds locally but fails on Render:
# - Check Render build logs for specific error
# - Verify Dockerfile path in render.yaml
# - Verify dockerContext in render.yaml

# If specific package fails:
# - Add explicit package reference in csproj
# - Run dotnet restore locally first
```

### Issue 2: Database Connection Fails

**Symptoms**:
- Backend logs show "Could not connect to database"
- API returns 500 errors

**Solutions**:
```bash
# Verify DATABASE_URL is correct
# In Render dashboard → Environment
# DATABASE_URL should be: postgresql://user:pass@host:5432/dbname

# Test connection from local machine
psql "postgresql://user:pass@host:5432/dbname" -c "SELECT 1"

# If connection times out:
# - Render free tier databases sleep after inactivity
# - First request may take 30-60 seconds to wake up
# - This is normal for free tier

# If authentication fails:
# - Verify username and password
# - Regenerate database credentials in Render dashboard
```

### Issue 3: CORS Errors

**Symptoms**:
- Browser console shows "Access-Control-Allow-Origin" error
- API calls fail with CORS error

**Solutions**:
```bash
# 1. Verify CORS_ORIGIN matches frontend URL EXACTLY
# Backend Render dashboard → Environment → CORS_ORIGIN
# Should be: https://your-project.vercel.app
# NO trailing slash

# 2. Verify backend CORS configuration
# In Program.cs, should have:
app.UseCors(options => options
    .WithOrigins(Environment.GetEnvironmentVariable("CORS_ORIGIN"))
    .AllowCredentials()
    .AllowAnyHeader()
    .AllowAnyMethod());

# 3. Redeploy backend after changing CORS_ORIGIN
# Render auto-redeploys when env var changes

# 4. Clear browser cache and hard reload
# Ctrl+Shift+R or Cmd+Shift+R
```

### Issue 4: SignalR Connection Fails

**Symptoms**:
- No WebSocket connection in browser DevTools
- Real-time updates don't work

**Solutions**:
```bash
# 1. Verify SignalR hub is mapped
# In Program.cs:
app.MapHub<MatchHub>("/hubs/matches");

# 2. Verify CORS allows WebSockets
# In CORS configuration:
.WithOrigins(...)
.AllowCredentials()  # This is required for SignalR

# 3. Check Render logs for SignalR errors
# Look for "SignalR" or "WebSocket" in logs

# 4. Verify frontend SignalR URL
# Should be: https://your-backend.onrender.com/hubs/matches
# NOT: http:// (must be https)

# 5. Test WebSocket connection manually
# Use browser extension: "Browser WebSocket Client"
# Connect to: wss://your-backend.onrender.com/hubs/matches
```

### Issue 5: Frontend Build Fails on Vercel

**Symptoms**: Vercel shows "Build failed" in deployment logs

**Solutions**:
```bash
# 1. Check build logs for specific error

# If TypeScript errors:
# - Fix TypeScript errors locally first
# - Run: npm run build
# - Commit fixes

# If "Cannot find module" errors:
# - Verify all dependencies in package.json
# - Run: npm install
# - Commit package-lock.json

# If build command fails:
# - Verify vercel-build script exists in package.json
# - Verify Angular build command is correct
# - For Angular 19: ng build --configuration production

# If output directory not found:
# - Verify Angular 19 outputs to dist/frontend/browser
# - Update vercel.json distDir if different
```

### Issue 6: PWA Not Installing

**Symptoms**:
- No install prompt appears
- "Add to Home Screen" option missing

**Solutions**:
```bash
# 1. Verify HTTPS (required for PWA)
# Both frontend and backend must use HTTPS
# Vercel and Render provide this automatically

# 2. Verify manifest.webmanifest
# Should be in src/ and referenced in index.html
<link rel="manifest" href="manifest.webmanifest">

# 3. Verify service worker
# Open DevTools → Application → Service Workers
# Should show ngsw-worker.js registered

# 4. Verify Angular service worker is enabled
# In angular.json:
"serviceWorker": true,
"ngswConfigPath": "ngsw-config.json"

# 5. Hard reload browser
# Ctrl+Shift+R to clear old service worker

# 6. Check PWA requirements met:
# - Served over HTTPS
# - Has valid manifest
# - Has service worker
# - Has icons (192x192 and 512x512)
```

### Issue 7: Render Free Tier Sleep

**Symptoms**:
- First request takes 30-60 seconds
- Subsequent requests are fast
- After 15 minutes of inactivity, slow again

**Explanation**:
- Render free tier services sleep after 15 minutes of inactivity
- First request wakes the service up (~30-60 seconds)
- This is normal and expected for free tier

**Solutions**:
```bash
# Option 1: Accept the limitation (free tier)
# First request will always be slow after sleep

# Option 2: Keep-alive ping (not recommended, may violate ToS)
# Create a cron job to ping /health every 14 minutes
# Note: This may violate Render's fair use policy

# Option 3: Upgrade to paid tier
# Paid services don't sleep
# Starts at $7/month

# Option 4: Show loading message
# In frontend, show "Waking up server..." message
# If first request takes >5 seconds
```

### Issue 8: Environment Variables Not Applied

**Symptoms**:
- Backend uses wrong values
- JWT secret not found
- Database connection uses default

**Solutions**:
```bash
# 1. Verify env vars are set in Render dashboard
# Go to service → Environment tab
# All required vars should be listed

# 2. Verify env var names match exactly
# Case-sensitive: DATABASE_URL not database_url

# 3. Redeploy after changing env vars
# Render may not auto-redeploy for some env var changes
# Manual redeploy: Dashboard → Manual Deploy → Deploy Latest Commit

# 4. Check env vars are read in code
# In Program.cs:
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

# 5. Verify no conflicting appsettings.json
# Production should use env vars, not appsettings.json
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Application works locally (frontend + backend + database)
- [ ] All tests passing
- [ ] Build succeeds with 0 warnings
- [ ] Dockerfile created and tested
- [ ] render.yaml created
- [ ] vercel.json created
- [ ] All deployment files committed and pushed

### Backend Deployment (Render)
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Database migrations applied
- [ ] All 8 tables exist in database
- [ ] Web service created
- [ ] All environment variables configured
- [ ] JWT_SECRET is secure random value
- [ ] FOOTBALL_DATA_API_KEY configured
- [ ] Backend deployed successfully
- [ ] Health check endpoint responds
- [ ] Can register/login via API

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] Project created and linked to GitHub
- [ ] Build settings configured correctly
- [ ] Environment variables set (NG_APP_API_URL)
- [ ] Frontend deployed successfully
- [ ] Application loads without errors
- [ ] No console errors

### Integration
- [ ] CORS configured correctly
- [ ] Frontend can call backend API
- [ ] No CORS errors in browser console
- [ ] Authentication flow works end-to-end
- [ ] SignalR connection established
- [ ] Real-time updates work

### PWA Features
- [ ] Service worker registered
- [ ] Manifest loaded
- [ ] Icons display correctly
- [ ] Install prompt appears
- [ ] Offline mode works
- [ ] Can install to home screen

### Testing
- [ ] All smoke tests passing
- [ ] Can register user
- [ ] Can login
- [ ] Can view matches
- [ ] Can submit predictions (if matches exist)
- [ ] Can view leaderboard
- [ ] Lighthouse PWA score: 100
- [ ] Lighthouse Performance: >90

### Security
- [ ] Both frontend and backend use HTTPS
- [ ] JWT authentication works
- [ ] Protected endpoints require valid token
- [ ] CORS restricts to frontend origin only
- [ ] No sensitive data in frontend code
- [ ] No secrets in git repository

### Documentation
- [ ] Production URLs documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Known issues documented
- [ ] PROGRESS.md updated (Phase 19 complete)

---

## 📊 POST-DEPLOYMENT METRICS

Track these metrics after deployment:

**Performance**:
- Frontend load time: <3s
- API response time: <500ms
- Database query time: <100ms
- Lighthouse Performance: >90
- Lighthouse PWA: 100

**Availability**:
- Backend uptime: >99% (excluding free tier sleep)
- Frontend uptime: >99.9%
- Database uptime: >99%

**Usage** (after 1 week):
- Registered users: X
- Active users: Y
- Predictions submitted: Z
- API requests: W

---

## 🎯 SUCCESS CRITERIA

Phase 19 (Production Deployment) is **COMPLETE** when:

1. ✅ Frontend deployed and accessible via HTTPS
2. ✅ Backend API deployed and accessible via HTTPS
3. ✅ PostgreSQL database created with all tables
4. ✅ All environment variables configured correctly
5. ✅ CORS configured (no CORS errors)
6. ✅ Can register and login
7. ✅ Can view matches (even if empty)
8. ✅ Can submit predictions (if matches exist)
9. ✅ Can view leaderboard
10. ✅ SignalR connection works
11. ✅ PWA features work (install, offline)
12. ✅ Lighthouse PWA score: 100
13. ✅ No errors in browser console
14. ✅ No errors in backend logs
15. ✅ All smoke tests passing

---

## 📝 DEPLOYMENT REPORT TEMPLATE

After successful deployment, create this report:

```markdown
## Production Deployment Report

**Date**: {TODAY}
**Deployed By**: DEPLOYMENT Agent
**Phase**: 19 (Production Deployment)
**Status**: ✅ Success / ⚠️ Partial / ❌ Failed

### URLs
- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/health

### Deployment Summary
- **Frontend Platform**: Vercel (Free tier)
- **Backend Platform**: Render Web Service (Free tier)
- **Database**: Render PostgreSQL (Free tier)
- **Total Cost**: $0/month

### Environment Configuration
- [x] All environment variables configured
- [x] CORS configured correctly
- [x] JWT authentication enabled
- [x] Database migrations applied
- [x] football-data.org API integrated

### Testing Results
- [x] Health check: PASS
- [x] User registration: PASS
- [x] User login: PASS
- [x] View matches: PASS
- [x] Submit predictions: {PASS/SKIP - no matches yet}
- [x] View leaderboard: PASS
- [x] SignalR connection: PASS
- [x] PWA install: PASS
- [x] Offline mode: PASS

### Performance Metrics
- **Lighthouse Performance**: {X}/100
- **Lighthouse PWA**: {Y}/100
- **Frontend Load Time**: {Z}s
- **API Response Time**: {W}ms

### Known Limitations
- Backend sleeps after 15 min inactivity (free tier)
- First request may take 30-60s
- Database limited to 1GB storage (free tier)

### Issues Encountered
{List any issues and how they were resolved}

### Next Steps
- Monitor application performance
- Set up uptime monitoring (UptimeRobot)
- Seed initial match data from football-data.org
- Promote to users

### Sign-Off
**Deployment Status**: ✅ Production Ready
**Agent**: DEPLOYMENT Agent
**Validated By**: ORCHESTRATOR Agent
```

---

**Version**: 2.0
**Created**: 2026-03-05
**Role**: Infrastructure & Deployment Specialist
**Delegation**: From ORCHESTRATOR for Phase 19
