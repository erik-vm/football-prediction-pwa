# 🚀 Deploy Your Football Prediction PWA NOW!

**Cost:** $0/month (100% FREE)
**Time:** 40 minutes total
**Difficulty:** Easy (step-by-step guide)

---

## ✅ Everything is Ready!

All configuration files have been created and pushed to GitHub:
- ✅ `render.yaml` - Backend deployment config
- ✅ `vercel.json` - Frontend deployment config
- ✅ Production environment files
- ✅ CORS configuration
- ✅ Secure JWT secret generated
- ✅ API key configured

---

## 🎯 Quick Start - Deploy in 3 Steps

### Step 1: Deploy Backend (15 min)
1. Go to https://render.com/ and sign up (FREE, no credit card)
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `erik-vm/football-prediction-pwa`
4. Render will auto-detect `render.yaml` and configure everything!
5. Just add these environment variables:
   - `FootballDataApi__ApiKey` = `2c778464a60e4b51b2407fcc62539791`
   - `Jwt__SecretKey` = `1PoVO2B/awHpRyCUjTzIDN/t4SWAhG4Hv2Jv87afgvl0TlTgD7vhNFliqaWVMme3LWKXG5+HrP6VbqsECZt3+w==`

### Step 2: Deploy Frontend (10 min)
1. Note your Render API URL (e.g., `https://football-prediction-api.onrender.com`)
2. Update `frontend/src/environments/environment.prod.ts` with your URL
3. Commit and push to GitHub
4. Go to https://vercel.com/ and sign up (FREE, no credit card)
5. Click "Add New..." → "Project"
6. Import `erik-vm/football-prediction-pwa`
7. Select `frontend` folder as root directory
8. Click "Deploy"!

### Step 3: Configure CORS (5 min)
1. Note your Vercel URL (e.g., `https://football-prediction-pwa.vercel.app`)
2. Go back to Render dashboard
3. Add environment variable:
   - `Cors__AllowedOrigins__0` = Your Vercel URL
4. Save and redeploy

---

## 📖 Detailed Instructions

**Open this file for step-by-step guide:**
```
.docs/DEPLOYMENT-GUIDE.md
```

This comprehensive guide includes:
- Detailed screenshots and instructions
- Troubleshooting tips
- Testing checklist
- Keep-alive setup (prevents backend sleep)
- Database management
- Update procedures

---

## 🎁 Bonus: Keep Your App Awake

**FREE Keep-Alive Service:**
1. Sign up at https://uptimerobot.com/ (FREE)
2. Add monitor:
   - URL: `https://your-api.onrender.com/health`
   - Interval: 5 minutes
3. Done! Your backend won't sleep anymore

---

## 📋 What You'll Get

After deployment, you'll have:

### Frontend (Vercel)
- URL: `https://football-prediction-pwa.vercel.app`
- Features:
  - ✅ Fast global CDN
  - ✅ Automatic HTTPS
  - ✅ Auto-deploy on git push
  - ✅ PWA with service worker
  - ✅ Mobile-responsive design

### Backend (Render)
- URL: `https://football-prediction-api.onrender.com`
- Features:
  - ✅ .NET 9 API
  - ✅ PostgreSQL database
  - ✅ Auto-deploy on git push
  - ✅ Background jobs (match sync, scoring)
  - ✅ JWT authentication
  - ✅ CORS configured

### Database (Render PostgreSQL)
- 1GB storage
- Auto-migrations on deploy
- Backed up automatically
- Free for 90 days (renewable)

---

## 💡 Quick Tips

**First Deployment:**
- Backend takes ~10 minutes to build
- Frontend takes ~3 minutes to build
- Database provisions in ~2 minutes

**After First Deploy:**
- Updates deploy in 2-5 minutes
- Just push to GitHub!

**Free Tier Limits:**
- Backend sleeps after 15 min inactivity
- First request wakes it up (~20-30 sec)
- Keep-alive service prevents this

---

## 🆘 Need Help?

**Common Issues:**

1. **Build fails on Render**
   - Check logs in Render dashboard
   - Verify environment variables are set
   - Ensure branch is `version_1_06_02_2026`

2. **Frontend can't connect to backend**
   - Check CORS configuration
   - Verify API URL in environment.prod.ts
   - Check backend is running (visit /health endpoint)

3. **Database connection error**
   - Verify ConnectionStrings__DefaultConnection
   - Check database is provisioned
   - Look for "Internal Database URL" in Render

**Full troubleshooting guide:** See `.docs/DEPLOYMENT-GUIDE.md`

---

## 📊 Deployment Checklist

- [ ] Sign up for Render.com
- [ ] Deploy backend (Web Service)
- [ ] Create PostgreSQL database
- [ ] Add environment variables
- [ ] Note Render API URL
- [ ] Update frontend environment.prod.ts
- [ ] Commit and push
- [ ] Sign up for Vercel
- [ ] Deploy frontend
- [ ] Note Vercel URL
- [ ] Update CORS on Render
- [ ] Test login/register
- [ ] Test predictions
- [ ] Test leaderboard
- [ ] Set up UptimeRobot (optional but recommended)
- [ ] 🎉 Share your app!

---

## 🎯 Ready to Deploy?

**Start here:** `.docs/DEPLOYMENT-GUIDE.md`

**Estimated time:** 40 minutes
**Difficulty:** Easy (follow the guide)
**Cost:** $0

**Let's get your app live!** 🚀
