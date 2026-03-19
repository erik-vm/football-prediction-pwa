# Deployment Guide - Football Prediction PWA

**Version**: 1.0
**Date**: 2026-03-19
**Stack**: Angular 19 + .NET 9 + PostgreSQL

---

## 🚀 Quick Start

This application is configured for **zero-cost** deployment using:
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **Database**: Render PostgreSQL (free tier)

---

## 📋 Prerequisites

1. **GitHub Account**: Code must be in a GitHub repository
2. **Vercel Account**: Sign up at https://vercel.com
3. **Render Account**: Sign up at https://render.com
4. **Git**: Code committed and pushed to GitHub

---

## 🔧 Deployment Files Created

### Backend (Render)
- ✅ `Dockerfile` - Multi-stage build for .NET 9
- ✅ `render.yaml` - Infrastructure as code
- ✅ `.dockerignore` - Exclude unnecessary files

### Frontend (Vercel)
- ✅ `vercel.json` - Build configuration
- ✅ `environment.prod.ts` - Production API URL

---

## 🌐 Step 1: Deploy Backend to Render

### 1.1 Push Code to GitHub
```bash
git add .
git commit -m "feat: Add deployment configuration"
git push origin version_2_12_03_2026
```

### 1.2 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repository

### 1.3 Deploy via Blueprint (Automated)
1. Click "New +"
2. Select "Blueprint"
3. Connect your GitHub repository
4. Select `render.yaml`
5. Click "Apply"

Render will automatically:
- Create PostgreSQL database
- Build Docker image from Dockerfile
- Deploy backend service
- Generate JWT secret key
- Configure environment variables

### 1.4 Wait for Database Creation
⏱️ **Database creation takes ~2-5 minutes**

### 1.5 Apply Database Migrations

**Option A: Using dotnet-ef (Local)**
```bash
# Set connection string from Render dashboard
$env:ConnectionStrings__DefaultConnection="<your-render-postgres-url>"

# Navigate to API project
cd backend/src/FootballPrediction.Api

# Apply migrations
dotnet ef database update --project ../FootballPrediction.Infrastructure
```

**Option B: Using SQL Script (Recommended)**
```bash
# Generate SQL script
cd backend/src/FootballPrediction.Api
dotnet ef migrations script --output migration.sql --project ../FootballPrediction.Infrastructure

# Copy migration.sql content
# Go to Render Dashboard → Database → Query
# Paste and execute SQL
```

### 1.6 Verify Backend Deployment
1. Go to Render Dashboard → Services → football-prediction-api
2. Copy the public URL (e.g., `https://football-prediction-api.onrender.com`)
3. Test health endpoint: `https://football-prediction-api.onrender.com/health`
4. Expected response: `"Healthy"`

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Update Production API URL (if different)
If your Render backend URL is different from the default:

1. Edit `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-RENDER-URL.onrender.com/api/v1'
};
```

2. Commit and push:
```bash
git add frontend/src/environments/environment.prod.ts
git commit -m "chore: Update production API URL"
git push origin version_2_12_03_2026
```

### 2.2 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repository

### 2.3 Deploy to Vercel
1. Click "Add New Project"
2. Import your GitHub repository
3. Vercel will auto-detect `vercel.json`
4. Click "Deploy"

⏱️ **Build takes ~2-3 minutes**

### 2.4 Verify Frontend Deployment
1. Vercel will show your deployment URL (e.g., `https://football-prediction-pwa.vercel.app`)
2. Open the URL in your browser
3. Test PWA installation (mobile)

---

## 🔐 Step 3: Configure CORS (Backend)

### 3.1 Update Program.cs
Add your Vercel URL to CORS policy:

```csharp
// In backend/src/FootballPrediction.Api/Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://football-prediction-pwa.vercel.app", // Add your Vercel URL
            "https://YOUR-CUSTOM-DOMAIN.com" // If using custom domain
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

### 3.2 Commit and Push
```bash
git add backend/src/FootballPrediction.Api/Program.cs
git commit -m "chore: Add production CORS origin"
git push origin version_2_12_03_2026
```

Render will auto-deploy the update (takes ~2-3 minutes).

---

## ✅ Step 4: Test End-to-End

### 4.1 Test User Flow
1. Open your Vercel URL
2. Register a new account
3. Login
4. Browse matches
5. Create a prediction
6. View leaderboard

### 4.2 Test PWA Installation (Mobile)
1. Open app on mobile device
2. Browser should show "Install App" prompt
3. Install to home screen
4. Open installed app
5. Test offline mode (enable airplane mode)

---

## 🎯 Production URLs

After successful deployment, you'll have:

**Frontend**: `https://football-prediction-pwa.vercel.app`
**Backend**: `https://football-prediction-api.onrender.com`
**Health Check**: `https://football-prediction-api.onrender.com/health`

---

## 📊 Free Tier Limitations

### Render (Backend + Database)
- **Service**: 750 hours/month (free)
- **Database**: 256 MB storage, 90 days retention
- **Cold Starts**: ~30-60 seconds after 15 min inactivity
- **Bandwidth**: 100 GB/month

### Vercel (Frontend)
- **Bandwidth**: 100 GB/month
- **Builds**: 6,000 minutes/month
- **Deployments**: Unlimited
- **Custom Domain**: Supported

⚠️ **Note**: Render free tier services sleep after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

---

## 🔧 Troubleshooting

### Backend Issues

**1. Migrations Failed**
```bash
# Check connection string format
# Render format: postgres://user:pass@host:port/dbname
# .NET format: Host=host;Port=port;Database=dbname;Username=user;Password=pass

# Convert if needed or use render.yaml (automatic conversion)
```

**2. Health Check Failing**
```bash
# Check logs in Render Dashboard
# Verify ASPNETCORE_URLS=http://+:8080
# Verify port 8080 is exposed in Dockerfile
```

**3. Database Connection Errors**
```bash
# Ensure ConnectionStrings__DefaultConnection env var is set
# Check Render dashboard for database connection string
# Verify database is created and running
```

### Frontend Issues

**1. API Calls Failing (CORS)**
- Check CORS configuration in backend
- Verify frontend is using correct API URL
- Check browser console for CORS errors

**2. Routes Returning 404**
- Verify `vercel.json` rewrites configuration
- Check `outputDirectory` points to correct path
- Ensure Angular routing is using HashLocationStrategy or rewrites

**3. Service Worker Not Registering**
- Verify `ngsw-worker.js` is in output directory
- Check service worker headers in `vercel.json`
- Test in incognito mode (clears SW cache)

---

## 🔄 Continuous Deployment

Both Render and Vercel are configured for automatic deployments:

**When you push to `version_2_12_03_2026` branch:**
1. ✅ Render automatically rebuilds backend
2. ✅ Vercel automatically rebuilds frontend
3. ⏱️ Total deployment time: ~5-8 minutes

---

## 📈 Monitoring & Logs

### Render (Backend)
1. Go to Render Dashboard
2. Click on `football-prediction-api` service
3. View "Logs" tab for real-time logs
4. View "Metrics" tab for performance

### Vercel (Frontend)
1. Go to Vercel Dashboard
2. Click on your project
3. View "Deployments" for build logs
4. View "Analytics" (if enabled)

---

## 🔐 Environment Variables

### Backend (Render)
Already configured in `render.yaml`:
- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__DefaultConnection` (from database)
- `Jwt__SecretKey` (auto-generated)
- `Jwt__Issuer=FootballPredictionAPI`
- `Jwt__Audience=FootballPredictionApp`
- `Jwt__AccessTokenExpirationMinutes=60`
- `Jwt__RefreshTokenExpirationDays=7`

### Frontend (Vercel)
No environment variables needed (API URL in `environment.prod.ts`).

---

## 🎯 Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Match list displays
- [ ] Predictions can be submitted
- [ ] Leaderboard displays
- [ ] PWA installable on mobile
- [ ] Offline mode works
- [ ] CORS configured correctly
- [ ] Database migrations applied
- [ ] Logs show no errors

---

## 🚀 Optional: Custom Domain

### Vercel (Frontend)
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render (Backend)
1. Upgrade to paid plan ($7/month)
2. Add custom domain in settings
3. Configure DNS

---

## 💰 Cost Summary

**Current Setup**: $0/month (100% free tier)

**If scaling needed**:
- Render Starter: $7/month (no cold starts)
- Vercel Pro: $20/month (more bandwidth)
- Render PostgreSQL: $7/month (more storage)

---

## 📞 Support

**Issues**: Check logs in Render/Vercel dashboards
**Docs**:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- .NET 9: https://docs.microsoft.com/dotnet
- Angular 19: https://angular.dev

---

**Deployment Ready!** 🎉

Follow steps 1-4 to deploy your application to production.
