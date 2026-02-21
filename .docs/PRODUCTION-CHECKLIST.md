# Production Deployment Checklist
**Football Prediction PWA**
**Version:** 1.0.0
**Date:** February 21, 2026

---

## Pre-Deployment Checklist

### Code Quality

- [x] All backend tests passing (70/70 tests)
- [x] Frontend component tests created and passing
- [x] No console errors in browser
- [x] No compiler warnings
- [x] Code reviewed and approved
- [ ] Security audit completed
- [x] SOLID principles followed
- [x] DRY principle applied
- [x] Code commented where necessary

### Testing

- [x] Backend unit tests passing
- [x] Backend integration tests passing
- [ ] Frontend component tests passing
- [ ] E2E user journey tests completed
- [ ] E2E admin journey tests completed
- [ ] Cross-browser testing completed
- [ ] Mobile responsive testing completed
- [ ] PWA installation tested
- [ ] Performance metrics acceptable (Lighthouse > 90)
- [ ] Load testing completed (optional)

### Security

- [ ] Environment variables secured (no secrets in code)
- [ ] JWT secret key generated (32+ characters)
- [ ] Database passwords strong and unique
- [ ] CORS configured for production domains only
- [ ] HTTPS enforced on all endpoints
- [ ] SQL injection prevention verified (EF Core)
- [ ] XSS prevention verified (Angular sanitization)
- [ ] Password hashing verified (BCrypt)
- [ ] Rate limiting implemented (optional)
- [ ] Admin account password changed from default

### Database

- [ ] Production database created
- [ ] Database connection string configured
- [ ] Migrations tested on staging database
- [ ] All migrations applied to production
- [ ] Database user has appropriate permissions (not superuser)
- [ ] Database backup strategy configured
- [ ] Database backup tested and verified
- [ ] Indexes optimized
- [ ] Admin user created in production database

### Backend

- [x] Production build successful (`dotnet publish -c Release`)
- [ ] Environment variables documented
- [ ] appsettings.Production.json configured
- [ ] Logging configured (file/service)
- [ ] Error handling tested
- [ ] Health check endpoint working
- [ ] API documentation updated (if using Swagger)
- [ ] CORS origins set to production frontend URL
- [ ] JWT settings configured correctly
- [ ] Database connection pooling configured

### Frontend

- [x] Production build successful (`ng build --configuration production`)
- [x] Bundle size analyzed and acceptable
  - Initial Total: 328.38 KB (90.19 KB gzipped)
  - Largest chunk: 158.68 KB (45.93 KB gzipped)
- [ ] environment.prod.ts configured with production API URL
- [ ] Base href set correctly
- [ ] Service worker configured
- [ ] PWA manifest configured
- [ ] Icons and splash screens present
- [ ] Meta tags set (title, description, OG tags)
- [ ] Analytics configured (optional)
- [ ] Error tracking configured (Sentry/etc)

### Infrastructure

- [ ] Domain name purchased and configured
- [ ] SSL certificates obtained and installed
- [ ] DNS records configured correctly
  - [ ] A record for frontend domain
  - [ ] A record for API domain (if separate)
  - [ ] CAA record for SSL (optional)
- [ ] CDN configured (optional)
- [ ] Firewall rules configured
  - [ ] Allow HTTPS (443)
  - [ ] Allow HTTP (80) for redirect
  - [ ] Allow PostgreSQL (5432) only from backend
  - [ ] Block all other ports
- [ ] Server monitoring configured
- [ ] Uptime monitoring configured (optional)

---

## Deployment Steps

### Phase 1: Database Deployment

1. [ ] Create production PostgreSQL database
2. [ ] Create database user with strong password
3. [ ] Grant appropriate permissions
4. [ ] Test database connection from backend server
5. [ ] Run all migrations
6. [ ] Verify migrations applied correctly
7. [ ] Seed admin user
8. [ ] Test admin login
9. [ ] Configure automated backups
10. [ ] Test backup and restore process

### Phase 2: Backend Deployment

1. [ ] Build backend for production
   ```bash
   cd backend/src/FootballPrediction.Api
   dotnet publish -c Release -o ./publish
   ```
2. [ ] Transfer files to server
3. [ ] Configure environment variables
4. [ ] Test database connection from backend
5. [ ] Run health check: `curl https://api.domain.com/health`
6. [ ] Start backend service
7. [ ] Test API endpoints
8. [ ] Verify logging is working
9. [ ] Monitor initial logs for errors

### Phase 3: Frontend Deployment

1. [ ] Update environment.prod.ts with production API URL
2. [ ] Build frontend for production
   ```bash
   cd frontend
   ng build --configuration production
   ```
3. [ ] Deploy to hosting platform (Vercel/Netlify/nginx)
4. [ ] Verify all files deployed correctly
5. [ ] Test frontend loads
6. [ ] Verify API calls work (check Network tab)
7. [ ] Test PWA installation
8. [ ] Verify service worker registered

### Phase 4: Integration Testing

1. [ ] Test user registration
2. [ ] Test user login
3. [ ] Test JWT token refresh
4. [ ] Test prediction submission
5. [ ] Test leaderboard viewing
6. [ ] Test admin login
7. [ ] Test tournament creation
8. [ ] Test match creation
9. [ ] Test result entry
10. [ ] Test cross-origin requests (CORS)

### Phase 5: Performance & Monitoring

1. [ ] Run Lighthouse performance audit
2. [ ] Verify all metrics > 90
3. [ ] Check API response times
4. [ ] Configure application monitoring
5. [ ] Configure error tracking
6. [ ] Set up log aggregation
7. [ ] Configure uptime monitoring
8. [ ] Set up alerts for downtime/errors

---

## Post-Deployment Checklist

### Immediate (0-24 hours)

- [ ] Verify application is accessible
- [ ] Monitor error logs closely
- [ ] Check server resource usage
- [ ] Test all critical user flows
- [ ] Verify emails/notifications working (if applicable)
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Verify backups running

### First Week

- [ ] Review error logs daily
- [ ] Monitor user registrations
- [ ] Check for unusual activity
- [ ] Verify automatic processes (backups, etc.)
- [ ] Gather user feedback
- [ ] Address any reported issues
- [ ] Update documentation as needed

### First Month

- [ ] Review performance metrics
- [ ] Analyze user behavior
- [ ] Optimize slow queries
- [ ] Review and update security measures
- [ ] Test backup restoration
- [ ] Plan for scaling if needed
- [ ] Update dependencies if security patches available

---

## Rollback Plan

### When to Rollback

Rollback immediately if:
- Critical security vulnerability discovered
- Data loss or corruption occurring
- Application completely unavailable
- Database migrations failed catastrophically

### Rollback Steps

#### Frontend Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
```bash
netlify rollback
```

**nginx:**
```bash
sudo cp -r /var/www/frontend.backup/* /var/www/frontend/
sudo systemctl reload nginx
```

#### Backend Rollback

1. Stop current version:
   ```bash
   sudo systemctl stop football-prediction-api
   ```

2. Restore previous version:
   ```bash
   sudo cp -r /var/www/api.backup/* /var/www/api/
   ```

3. Restart service:
   ```bash
   sudo systemctl start football-prediction-api
   ```

#### Database Rollback

**CAUTION:** Only if migrations caused issues

```bash
# List applied migrations
dotnet ef migrations list

# Remove last migration (DESTRUCTIVE)
dotnet ef database update {PreviousMigrationName}

# Or restore from backup
gunzip -c /var/backups/db_backup.sql.gz | psql -h host -U user -d database
```

---

## Environment-Specific Configuration

### Development

```bash
ASPNETCORE_ENVIRONMENT=Development
Cors__AllowedOrigins__0=http://localhost:4200
```

### Staging

```bash
ASPNETCORE_ENVIRONMENT=Staging
Cors__AllowedOrigins__0=https://staging.yourdomain.com
```

### Production

```bash
ASPNETCORE_ENVIRONMENT=Production
Cors__AllowedOrigins__0=https://yourdomain.com
Cors__AllowedOrigins__1=https://www.yourdomain.com
```

---

## Critical Production Settings

### Backend (appsettings.Production.json)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "USE ENVIRONMENT VARIABLE"
  },
  "JwtSettings": {
    "SecretKey": "USE ENVIRONMENT VARIABLE",
    "Issuer": "FootballPredictionAPI",
    "Audience": "FootballPredictionClient",
    "ExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["USE ENVIRONMENT VARIABLE"]
  }
}
```

### Frontend (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

---

## Security Hardening

### Backend Security

- [ ] Remove Swagger in production (or protect with authentication)
- [ ] Disable detailed error messages in production
- [ ] Enable HTTPS redirection
- [ ] Set secure headers (HSTS, X-Frame-Options, etc.)
- [ ] Implement rate limiting on authentication endpoints
- [ ] Log security events (failed logins, etc.)
- [ ] Regularly update dependencies
- [ ] Use secrets management (Azure Key Vault, AWS Secrets Manager)

### Database Security

- [ ] Use strong passwords
- [ ] Limit network access to database
- [ ] Use least-privilege principle for database users
- [ ] Enable SSL for database connections
- [ ] Regular security updates
- [ ] Monitor for suspicious queries
- [ ] Enable query logging (temporarily for debugging)

### Infrastructure Security

- [ ] Keep server OS updated
- [ ] Configure firewall rules
- [ ] Disable root login (SSH)
- [ ] Use SSH keys instead of passwords
- [ ] Enable automatic security updates
- [ ] Configure fail2ban (optional)
- [ ] Regular security audits

---

## Monitoring & Alerting

### Metrics to Monitor

**Application:**
- Request rate
- Error rate
- Response times (p50, p95, p99)
- Active users
- Database connections

**Infrastructure:**
- CPU usage
- Memory usage
- Disk space
- Network traffic
- SSL certificate expiration

### Recommended Tools

- **Application Monitoring:** Application Insights, New Relic, Datadog
- **Uptime Monitoring:** UptimeRobot, Pingdom, StatusCake
- **Error Tracking:** Sentry, Rollbar, Bugsnag
- **Log Management:** Seq, Elasticsearch, CloudWatch

---

## Documentation

- [x] Deployment guide complete
- [x] E2E testing guide complete
- [ ] API documentation updated
- [ ] User guide created (optional)
- [ ] Admin guide created (optional)
- [ ] Runbook for common issues created
- [x] Environment variables documented
- [ ] Architecture diagrams updated (if applicable)

---

## Sign-Off

### Development Team

- [ ] Lead Developer: _____________________ Date: _______
- [ ] Frontend Developer: __________________ Date: _______
- [ ] Backend Developer: ___________________ Date: _______

### QA Team

- [ ] QA Lead: ____________________________ Date: _______
- [ ] Tester: _____________________________ Date: _______

### Operations Team

- [ ] DevOps Engineer: ____________________ Date: _______
- [ ] System Administrator: ________________ Date: _______

### Management

- [ ] Project Manager: _____________________ Date: _______
- [ ] Product Owner: ______________________ Date: _______

---

## Post-Deployment Communication

### Internal Announcement

**Subject:** Football Prediction PWA - Production Deployment Complete

**Body:**
```
Team,

The Football Prediction PWA has been successfully deployed to production!

Production URLs:
- Frontend: https://yourdomain.com
- API: https://api.yourdomain.com
- Admin Panel: https://yourdomain.com/admin

Admin Credentials: [Securely shared separately]

Please monitor the application closely over the next 24-48 hours and report any issues immediately.

Monitoring Dashboard: [URL]
Error Tracking: [URL]

Thank you for your hard work!
```

### User Announcement (if applicable)

**Subject:** New Football Prediction App Now Live!

**Body:**
```
Hello,

We're excited to announce that our Football Prediction application is now live!

Visit: https://yourdomain.com

Features:
- Make predictions for upcoming matches
- Compete on the leaderboard
- Track your prediction accuracy
- Weekly bonuses for top performers

Get started by registering for a free account!

Best regards,
The Team
```

---

## Troubleshooting Common Issues

### Issue: Application Won't Start

**Check:**
1. Environment variables set correctly
2. Database connection string valid
3. Port not already in use
4. Sufficient disk space
5. Check logs: `journalctl -u football-prediction-api -n 50`

### Issue: CORS Errors

**Check:**
1. Frontend domain in `Cors:AllowedOrigins`
2. Protocol matches (http vs https)
3. No trailing slash in origin URL
4. CORS middleware configured in correct order

### Issue: Database Connection Failed

**Check:**
1. Database server running
2. Firewall allows connection
3. Credentials correct
4. Database name exists
5. Test with psql: `psql -h host -U user -d database`

### Issue: JWT Token Invalid

**Check:**
1. JWT secret key same across deployments
2. Token not expired
3. Token format correct (Bearer {token})
4. Clock skew between servers

---

**Document Version:** 1.0.0
**Status:** Ready for Production
**Last Updated:** February 21, 2026
**Next Review:** After first deployment
