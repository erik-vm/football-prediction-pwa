# 🚀 Football Prediction PWA - Deployment Instructions

**Last Updated**: 2026-03-19
**Status**: Production Ready
**Deployment Target**: Zero-Cost Hosting (Render + Vercel)

---

## 📋 Prerequisites

Before deploying, ensure you have:

✅ GitHub account (for repository)
✅ Render account (for backend) - https://render.com
✅ Vercel account (for frontend) - https://vercel.com
✅ All code committed and pushed to GitHub
✅ Build status: All passing (0 errors)

---

## 🏗️ Architecture Overview

**Backend**: Render Web Service (Docker) + PostgreSQL
**Frontend**: Vercel Static Site (Angular)
**Database**: Render PostgreSQL 16 (free tier)
**Cost**: $0/month (free tiers)

---

## 📦 PART 1: Backend Deployment (Render)

### Step 1: Prepare Repository

Ensure these files exist in your repository root:
- ✅ `Dockerfile` (backend multi-stage build)
- ✅ `render.yaml` (infrastructure as code)
- ✅ `.dockerignore` (optimize build)

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Using render.yaml

#### Option A: Automatic Deployment (Recommended)

1. Go to Render Dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select repository: `football-prediction-pwa`
5. Render will automatically detect `render.yaml`
6. Click "Apply"
7. Render will create:
   - PostgreSQL database
   - Web service (API)
   - Environment variables

#### Option B: Manual Deployment

If Blueprint doesn't work:

**Create Database First**:
1. Dashboard → "New" → "PostgreSQL"
2. Name: `football-prediction-db`
3. Database: `football_prediction`
4. User: `postgres` (auto-generated)
5. Region: `Oregon (US West)`
6. Plan: `Free`
7. Click "Create Database"
8. **Save Internal Database URL** (shows after creation)

**Create Web Service**:
1. Dashboard → "New" → "Web Service"
2. Connect repository: `football-prediction-pwa`
3. Name: `football-prediction-api`
4. Region: `Oregon (US West)`
5. Branch: `version_2_12_03_2026` (or your main branch)
6. Root Directory: (leave empty)
7. Runtime: `Docker`
8. Plan: `Free`

**Configure Environment Variables**:
Click "Environment" tab and add:

```
DATABASE_URL=<your-internal-database-url-from-step-above>
JWT__SECRETKEY=<generate-random-32-char-string>
JWT__ISSUER=FootballPredictionApi
JWT__AUDIENCE=FootballPredictionClient
ASPNETCORE_ENVIRONMENT=Production
```

**Generate JWT Secret** (PowerShell):
```powershell
-join ((65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Or use: `openssl rand -base64 32`

9. Click "Create Web Service"
10. Wait for build (~5-10 minutes)

### Step 4: Run Database Migrations

Once service is deployed:

1. Get database connection string from Render
2. Install PostgreSQL client (if not already installed)
3. Connect to database:

```bash
psql "<your-external-database-url>"
```

4. Verify connection
5. Migrations should auto-apply on first run (via EF Core)
6. If not, run manually:

```bash
cd backend
dotnet ef migrations script --output migration.sql
# Copy SQL and run in Render database
```

### Step 5: Verify Backend

1. Get your service URL: `https://football-prediction-api.onrender.com`
2. Test health endpoint:
   ```bash
   curl https://football-prediction-api.onrender.com/health
   ```
3. Expected response: `{"status": "Healthy"}`
4. Test API documentation: `https://football-prediction-api.onrender.com/swagger`

### Step 6: Add Initial Data

You need to add at least one tournament and matches for the app to work:

**Option A**: Use API endpoints (POST via Postman/curl)
**Option B**: Insert directly into database:

```sql
-- Connect to database
psql "<your-external-database-url>"

-- Create tournament
INSERT INTO "Tournaments" ("Id", "Name", "Season", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (gen_random_uuid(), 'Premier League', '2025-2026', true, NOW(), NOW());

-- Get tournament ID
SELECT "Id", "Name" FROM "Tournaments";

-- Create game week
INSERT INTO "GameWeeks" ("Id", "TournamentId", "WeekNumber", "StartDate", "EndDate", "CreatedAt", "UpdatedAt")
VALUES (gen_random_uuid(), '<tournament-id>', 1, '2026-03-20', '2026-03-27', NOW(), NOW());

-- Get game week ID
SELECT "Id", "WeekNumber" FROM "GameWeeks";

-- Create matches
INSERT INTO "Matches" ("Id", "TournamentId", "GameWeekId", "HomeTeam", "AwayTeam", "KickoffTime", "Status", "CreatedAt", "UpdatedAt")
VALUES
  (gen_random_uuid(), '<tournament-id>', '<gameweek-id>', 'Arsenal', 'Chelsea', '2026-03-22 15:00:00', 'SCHEDULED', NOW(), NOW()),
  (gen_random_uuid(), '<tournament-id>', '<gameweek-id>', 'Liverpool', 'Man City', '2026-03-22 17:30:00', 'SCHEDULED', NOW(), NOW());
```

---

## 🎨 PART 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

Update production API URL in `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://football-prediction-api.onrender.com/api/v1'
};
```

Commit and push this change.

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 3: Deploy Frontend

1. Vercel Dashboard → "Add New" → "Project"
2. Import Git Repository
3. Select: `football-prediction-pwa`
4. Configure:
   - **Framework Preset**: Angular
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`
5. Click "Deploy"
6. Wait for build (~3-5 minutes)

### Step 4: Verify Frontend

1. Get your Vercel URL: `https://your-project.vercel.app`
2. Open in browser
3. Test:
   - ✅ Page loads
   - ✅ Offline indicator works (turn off network)
   - ✅ Can register new user
   - ✅ Can login
   - ✅ Tournament list displays
   - ✅ Can view matches
   - ✅ Can make predictions

### Step 5: Configure Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## 🔒 PART 3: Security & Configuration

### Backend Security

1. **JWT Secret**: Use strong random secret (32+ characters)
2. **CORS**: Update allowed origins in `Program.cs` if using custom domain
3. **Database**: Use strong password (Render auto-generates)
4. **HTTPS**: Enforced by Render (automatic)

### Frontend Security

1. **Environment Variables**: Never commit API keys to git
2. **Service Worker**: Cache strategies configured
3. **CSP Headers**: Configured in `vercel.json`

### Optional: football-data.org Integration

If you want live match data:

1. Sign up at https://www.football-data.org/
2. Get API key (free tier: 10 calls/min)
3. Add to Render environment variables:
   ```
   FOOTBALLDATA__APIKEY=your-api-key-here
   ```
4. Redeploy service
5. Background job will start syncing automatically

---

## 📊 PART 4: Monitoring & Maintenance

### Backend Monitoring (Render)

1. Dashboard → Your Service → Logs
2. Monitor for errors
3. Health checks run automatically
4. Metrics available in Dashboard

### Frontend Monitoring (Vercel)

1. Dashboard → Your Project → Analytics
2. View page load times
3. Error tracking
4. Deployment history

### Database Backups

**Render Free Tier**: No automatic backups

**Manual Backup**:
```bash
pg_dump "<external-database-url>" > backup.sql
```

**Paid Plan**: Automatic daily backups available

### Scaling

**Current**: Free tier (512 MB RAM, 0.1 CPU)

**If needed**:
1. Render: Upgrade to Starter ($7/month) for 1 GB RAM
2. Vercel: Free tier handles ~100GB bandwidth
3. Database: Upgrade for more storage/connections

---

## 🐛 PART 5: Troubleshooting

### Backend Issues

**Problem**: Build fails on Render
**Solution**: Check Dockerfile, ensure .NET 9 SDK specified

**Problem**: Database connection fails
**Solution**: Verify DATABASE_URL format, check if database is running

**Problem**: Migrations don't apply
**Solution**: Run migrations manually via psql

**Problem**: Health check fails
**Solution**: Check logs, verify /health endpoint works locally

### Frontend Issues

**Problem**: Build fails on Vercel
**Solution**: Check package.json, ensure all dependencies installed

**Problem**: API calls fail (CORS)
**Solution**: Add Vercel URL to CORS policy in backend Program.cs

**Problem**: Service worker not working
**Solution**: Verify ngsw-config.json, check browser console

**Problem**: Offline mode not working
**Solution**: Test with DevTools Network offline, check localStorage

### Database Issues

**Problem**: Connection pool exhausted
**Solution**: Upgrade database plan or reduce connection pool size

**Problem**: Slow queries
**Solution**: Add indexes, optimize queries, check EXPLAIN plans

---

## ✅ PART 6: Post-Deployment Checklist

### Functional Tests

- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Can view tournaments
- [ ] Can view matches (filtered by tournament)
- [ ] Can create predictions (before deadline)
- [ ] Can view leaderboard (overall and per tournament)
- [ ] Can view own predictions
- [ ] Offline indicator appears when offline
- [ ] Predictions queue when offline
- [ ] Background jobs running (check logs)

### Performance Tests

- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] PWA installs successfully
- [ ] Offline mode works
- [ ] Service worker caches correctly

### Security Tests

- [ ] Cannot access protected routes without login
- [ ] Token expires after configured time
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] No secrets in client-side code

---

## 🎉 PART 7: Going Live

Once all tests pass:

1. ✅ Update README.md with live URLs
2. ✅ Share with users
3. ✅ Monitor for issues (first 24 hours critical)
4. ✅ Set up error alerts (optional)
5. ✅ Plan for regular maintenance

### Recommended Tools

- **Monitoring**: Render Dashboard + Vercel Analytics
- **Error Tracking**: Sentry (optional)
- **Uptime Monitoring**: UptimeRobot (free)
- **Database GUI**: pgAdmin or DBeaver

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Angular Docs**: https://angular.dev
- **EF Core Docs**: https://docs.microsoft.com/ef/core

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

**Setup**:
1. Push to GitHub
2. Render/Vercel detect changes
3. Auto-deploy to production

**Recommended**:
- Use `main` branch for production
- Use `develop` branch for staging
- Create preview deployments for PRs

---

## 💰 Cost Breakdown

**Current (Free Tier)**:
- Render Web Service: $0/month
- Render PostgreSQL: $0/month
- Vercel Hosting: $0/month
- **Total**: $0/month

**Limitations**:
- Render: Spins down after 15 min inactivity (30s cold start)
- Database: 1 GB storage, 97 connections
- Vercel: 100 GB bandwidth/month

**Upgrade Path (if needed)**:
- Render Starter: $7/month (no spin down)
- Database Starter: $7/month (backups, more storage)
- Vercel Pro: $20/month (more bandwidth)

---

## 🎯 Success Criteria

Deployment is successful when:

✅ Backend responds to health checks
✅ Frontend loads without errors
✅ Users can register and login
✅ Predictions can be submitted
✅ Leaderboards display correctly
✅ PWA features work
✅ No critical errors in logs

---

**Deployment Status**: 🚀 Ready
**Estimated Time**: 30-45 minutes (first time)
**Difficulty**: Intermediate

Good luck with your deployment! 🎉
