# Requirements

## Functional Requirements

### Authentication
- User registration with username, email, password
- User login with email and password
- JWT-based authentication (60-min access token, 7-day refresh token)
- BCrypt password hashing (cost factor 12)
- Protected routes require valid JWT
- Token refresh mechanism

### Match Management
- Display upcoming, live, and completed matches in tabs
- Filter by competition and matchday
- Auto-select nearest matchday per tab
- Show match details (teams, time, status, score)
- Manual sync button to refresh data
- Automatic sync every 60 minutes

### Predictions
- Submit score predictions before match kickoff
- One prediction per user per match
- Edit predictions before kickoff
- View all personal predictions with results
- Countdown timer to prediction deadline

### Scoring
- Automatic scoring when match results arrive (see GAME-RULES.md)
- 5-tier scoring system (5/4/3/1/0 points)
- Multiple scoring triggers (sync, manual result, background job)
- Idempotent scoring (never double-score)

### Leaderboard
- Per-competition leaderboards
- Overall tournament leaderboards
- User ranking with total points, predictions count, accuracy
- Current user highlighted
- Top 3 with medal indicators

### Data Integration
- Sync from football-data.org API v4
- 12 competitions supported
- Automatic tournament creation
- Match status tracking (SCHEDULED → IN_PLAY → FINISHED)

### User Preferences
- Select preferred competitions
- Persisted locally

### PWA
- Installable on mobile devices
- Basic offline support
- Offline prediction queuing

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | API responses < 500ms |
| Security | Passwords BCrypt hashed, JWT for auth, CORS configured |
| Reliability | Background jobs with error handling and retry |
| Scalability | Stateless API, database-backed sessions |
| Accessibility | Responsive design, mobile-first |
| Code Quality | SOLID, DRY, KISS, Clean Architecture |
| Testing | Unit tests for all business logic, integration tests for API |
| Deployment | Zero-downtime on free tiers (Vercel + Render) |
