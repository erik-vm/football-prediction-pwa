# Football Prediction PWA - FREE Deployment Guide

**Platform:** Render.com (Backend + Database) + Vercel (Frontend)
**Cost:** $0/month
**Deployment Branch:** `version_1_06_02_2026`
**Repository:** https://github.com/erik-vm/football-prediction-pwa

---

## Prerequisites

✅ **Completed:**
- GitHub repository is public
- football-data.org API Key: `2c778464a60e4b51b2407fcc62539791`
- Production environment files created
- Deployment configuration files created

**You Need:**
- Email address for Render.com account
- Email address for Vercel.com account

---

## Phase 1: Deploy Backend to Render.com (15 minutes)

### Step 1.1: Create Render Account
1. Go to: https://render.com/
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. **No credit card required!**

### Step 1.2: Create Web Service from GitHub
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account (authorize Render)
3. Select repository: `football-prediction-pwa`
4. Click **"Connect"**

### Step 1.3: Configure Web Service
**Basic Settings:**
- **Name:** `football-prediction-api` (or your choice)
- **Region:** Oregon (Free tier available)
- **Branch:** `version_1_06_02_2026`
- **Root Directory:** (leave empty)
- **Runtime:** `.NET`

**Build & Deploy:**
- **Build Command:**
  ```
  cd backend/src/FootballPrediction.Api && dotnet publish -c Release -o ../../../out
  ```

- **Start Command:**
  ```
  cd out && dotnet FootballPrediction.Api.dll
  ```

**Instance Type:**
- **Free** (select this!)

### Step 1.4: Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

| Key | Value |
|-----|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://0.0.0.0:$PORT` |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `true` |
| `Jwt__SecretKey` | `1PoVO2B/awHpRyCUjTzIDN/t4SWAhG4Hv2Jv87afgvl0TlTgD7vhNFliqaWVMme3LWKXG5+HrP6VbqsECZt3+w==` |
| `Jwt__Issuer` | `FootballPredictionAPI` |
| `Jwt__Audience` | `FootballPredictionClient` |
| `Jwt__AccessTokenExpirationMinutes` | `1440` |
| `FootballDataApi__BaseUrl` | `https://api.football-data.org/v4/` |
| `FootballDataApi__ApiKey` | `2c778464a60e4b51b2407fcc62539791` |
| `BackgroundJobs__MatchSyncIntervalHours` | `6` |

**Note:** We'll add the database connection string after creating the database.

### Step 1.5: Create PostgreSQL Database
1. Go back to Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. **Name:** `football-prediction-db`
4. **Database:** `football_prediction`
5. **Region:** Oregon (same as web service)
6. **Instance Type:** **Free**
7. Click **"Create Database"**

Wait 2-3 minutes for database to provision.

### Step 1.6: Connect Database to Web Service
1. Go to your database page
2. Scroll to **"Connections"**
3. Copy the **"Internal Database URL"** (starts with `postgresql://`)
4. Go back to your Web Service
5. Click **"Environment"** tab
6. Click **"Add Environment Variable"**
   - **Key:** `ConnectionStrings__DefaultConnection`
   - **Value:** Paste the Internal Database URL
7. Click **"Save Changes"**

### Step 1.7: Deploy!
1. Your service should start deploying automatically
2. **First deploy takes 5-10 minutes**
3. Watch the logs in the **"Logs"** tab
4. Look for: `Application started. Press Ctrl+C to shut down.`
5. Your API URL will be: `https://football-prediction-api.onrender.com`

**Note the URL** - you'll need it for the frontend!

---

## Phase 2: Deploy Frontend to Vercel (10 minutes)

### Step 2.1: Update Frontend Environment
Before deploying, we need to update the API URL with your actual Render URL.

1. Open: `frontend/src/environments/environment.prod.ts`
2. Update the `apiUrl` to your Render URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://YOUR-ACTUAL-URL.onrender.com/api',
     apiTimeout: 30000,
   };
   ```
3. Replace `YOUR-ACTUAL-URL` with your actual Render service URL
4. Commit and push:
   ```bash
   git add frontend/src/environments/environment.prod.ts
   git commit -m "Update production API URL"
   git push origin version_1_06_02_2026
   ```

### Step 2.2: Create Vercel Account
1. Go to: https://vercel.com/
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. **No credit card required!**

### Step 2.3: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `football-prediction-pwa`
3. Click **"Import"**

### Step 2.4: Configure Project
**Framework Preset:**
- Should auto-detect as **Angular**

**Root Directory:**
- Click **"Edit"**
- Select `frontend` folder

**Build Settings:**
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist/frontend/browser` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**Environment Variables:**
- None needed! (environment.prod.ts has the URL)

### Step 2.5: Deploy!
1. Click **"Deploy"**
2. **First deploy takes 2-3 minutes**
3. Watch the build logs
4. When complete, you'll see: **"Deployment Ready!"**
5. Your app URL will be: `https://football-prediction-pwa.vercel.app`

---

## Phase 3: Update CORS (5 minutes)

Now that you have your Vercel URL, update CORS on the backend:

### Step 3.1: Add Vercel URL to Render
1. Go to your Render Web Service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
   - **Key:** `Cors__AllowedOrigins__0`
   - **Value:** Your Vercel URL (e.g., `https://football-prediction-pwa.vercel.app`)
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## Phase 4: Set Up Keep-Alive (10 minutes)

Prevent your backend from sleeping with a free keep-alive service.

### Option A: UptimeRobot (Recommended)

1. Go to: https://uptimerobot.com/
2. Create free account
3. Click **"Add New Monitor"**
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Football Prediction API
   - **URL:** `https://your-api.onrender.com/health`
   - **Monitoring Interval:** 5 minutes (free tier)
4. Click **"Create Monitor"**

Done! Your backend will be pinged every 5 minutes and won't sleep.

### Option B: Cron-job.org (Alternative)

1. Go to: https://cron-job.org/
2. Create free account
3. Create new cron job:
   - **Title:** Keep Alive Football API
   - **Address:** `https://your-api.onrender.com/health`
   - **Interval:** Every 14 minutes
4. Enable the job

---

## Phase 5: Test Your Deployment (10 minutes)

### Test Checklist

1. ✅ **Frontend loads:**
   - Visit your Vercel URL
   - Should see login/register page

2. ✅ **Backend health:**
   - Visit: `https://your-api.onrender.com/health`
   - Should return `200 OK`

3. ✅ **Register a user:**
   - Click "Register"
   - Create test account
   - Should redirect to login

4. ✅ **Login:**
   - Login with test account
   - Should redirect to predictions page

5. ✅ **View matches:**
   - Should see match list
   - Matches loaded from football-data.org

6. ✅ **Make prediction:**
   - Click on a match
   - Enter score prediction
   - Submit - should save

7. ✅ **View leaderboard:**
   - Click Leaderboard
   - Should see empty or initial rankings

8. ✅ **Check preferences:**
   - Click Profile icon (bottom nav on mobile)
   - Should see user profile
   - Can select/deselect competitions

---

## Your Deployed URLs

### Production URLs
- **Frontend:** `https://football-prediction-pwa.vercel.app`
- **Backend API:** `https://football-prediction-api.onrender.com`
- **Database:** Render PostgreSQL (internal URL)

### Admin Links
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com/

---

## Updating Your App

### Making Changes

**Frontend Changes:**
1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin version_1_06_02_2026
   ```
3. Vercel auto-deploys in ~2 minutes
4. Visit your Vercel URL to see changes

**Backend Changes:**
1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin version_1_06_02_2026
   ```
3. Render auto-deploys in ~5-10 minutes
4. Visit your Render URL to see changes

---

## Database Management

### Viewing Data
1. Go to Render Dashboard
2. Click your PostgreSQL database
3. Click **"Connect"** → Use the connection string with a PostgreSQL client
4. Or use **pgAdmin** or **DBeaver** to connect

### Backup Database (Every 90 Days)
The free PostgreSQL database expires after 90 days. Here's how to backup:

1. **Create backup script** (I'll create this for you)
2. **Before 90 days:**
   - Run backup script
   - Download backup file
3. **After expiry:**
   - Create new free PostgreSQL database
   - Restore from backup
   - Update connection string

---

## Troubleshooting

### Backend is sleeping (first request slow)
- **Cause:** Free tier sleeps after 15 min inactivity
- **Solution:** Set up UptimeRobot (see Phase 4)

### Frontend can't connect to backend
- **Check:** CORS configuration in Render environment variables
- **Fix:** Add your Vercel URL to `Cors__AllowedOrigins__0`

### Database connection error
- **Check:** Connection string in Render environment
- **Fix:** Copy "Internal Database URL" from database page

### Build fails on Render
- **Check:** Build logs in Render dashboard
- **Common fix:** Ensure .NET 9 is being used
- **Fix:** Check build command is correct

### Build fails on Vercel
- **Check:** Build logs in Vercel dashboard
- **Common fix:** Node version mismatch
- **Fix:** Ensure npm install completes successfully

---

## Monitoring & Maintenance

### Weekly Checks
- ✅ Check if backend is responding (visit /health endpoint)
- ✅ Check if frontend loads correctly
- ✅ Monitor UptimeRobot dashboard

### Monthly Checks
- ✅ Review Render usage (should be within free tier)
- ✅ Review Vercel usage (should be within free tier)
- ✅ Check database size (should be under 1GB)

### Every 90 Days
- ⚠️ **Database expiration approaching**
- Create new database
- Migrate data
- Update connection string

---

## Cost Breakdown

### Render.com
- **Web Service (Free tier):** $0/month
  - 750 hours/month
  - Sleeps after 15 min inactivity
  - Shared CPU/RAM
- **PostgreSQL (Free tier):** $0/month
  - 1GB storage
  - 90-day expiration (renewable)

### Vercel
- **Hobby Plan:** $0/month
  - 100GB bandwidth/month
  - Unlimited sites
  - Automatic SSL

### Total: $0/month 🎉

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Update CORS
4. ✅ Set up keep-alive
5. ✅ Test everything
6. 🚀 **Share your app with friends!**

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Check Render/Vercel logs for errors
3. Verify environment variables are set correctly
4. Check that branch `version_1_06_02_2026` is up to date

---

**Ready to deploy? Let's start with Phase 1!** 🚀

**Questions before we begin?**
