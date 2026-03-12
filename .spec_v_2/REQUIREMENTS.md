# Football Prediction Game - Requirements Specification

## Document Overview

**Project Name**: Football Prediction PWA
**Tech Stack**: Angular 19 + .NET 9 + PostgreSQL
**Based On**: Correct implementation from Spring Boot + React version
**Purpose**: Complete rewrite of Flutter mobile app with correct game rules

---

## 1. Project Overview

### 1.1 Purpose
A Progressive Web App (PWA) for friends to predict football match scores, compete on leaderboards, and track statistics throughout tournament seasons (primarily Champions League).

### 1.2 Target Users
- Small groups of friends (5-20 players)
- Mobile-first usage (predictions on smartphones)
- Admin users for match management
- Estonian-speaking primary audience (future enhancement)

### 1.3 Key Goals
- **Correct game rules** (see `.specs/GAME-RULES.md`)
- Mobile-first PWA for offline capability
- Automate scoring calculations
- Real-time leaderboard updates
- Reduce manual administrative work
- Modern, performant tech stack

---

## 2. Functional Requirements

### 2.1 User Authentication & Authorization

#### FR-AUTH-1: User Registration
- Users can register with:
  - Username (unique, 3-20 characters)
  - Email (unique, valid format)
  - Password (minimum 8 characters, maximum 64)
- Password validation:
  - No complexity requirements (allow any composition)
  - Check against breached password database (k-anonymity API)
  - Allow paste functionality
- Email verification (optional for MVP)

#### FR-AUTH-2: User Login
- Login with email + password
- JWT token-based authentication
- Refresh token rotation
- Remember me functionality (7-day token)

#### FR-AUTH-3: Password Management
- Change password (requires current password)
- Reset password via email (future)
- View active sessions
- Terminate other sessions

#### FR-AUTH-4: Role-Based Access Control
- **Roles**:
  - `USER` - Standard player
  - `ADMIN` - Tournament administrator
- Admin-only endpoints protected with `[Authorize(Roles = "ADMIN")]`

---

### 2.2 Tournament & Match Management (Admin)

#### FR-TOURNAMENT-1: Create Tournaments
- Admin can create tournaments with:
  - Name (e.g., "Champions League 2024/25")
  - Season (e.g., "2024/25")
  - Start date
  - End date
  - Active status (boolean)
- Only one tournament can be active at a time

#### FR-GAMEWEEK-2: Create Game Weeks
- Admin can create game weeks within tournament:
  - Week number (1-10)
  - Start date
  - End date
  - Tournament reference
- Game weeks define weekly leaderboard periods

#### FR-MATCH-3: Manual Match Creation
- Admin can manually create matches:
  - Home team name
  - Away team name
  - Kickoff date & time (UTC)
  - Tournament stage (GROUP_STAGE, ROUND_OF_16, QUARTER_FINALS, SEMI_FINALS, FINAL)
  - Game week assignment
- Stage determines point multiplier (1x-5x)

#### FR-MATCH-4: Import Matches from API
- Admin can import matches from football-data.org API
- Automatically populate:
  - Team names
  - Kickoff times
  - Tournament stage (mapped from competition phase)
- Assign to selected game week

#### FR-MATCH-5: Update Matches
- Admin can edit match details before kickoff
- Cannot edit after kickoff to preserve prediction integrity

#### FR-RESULT-1: Enter Match Results
- Admin enters final scores:
  - Home score (0-99)
  - Away score (0-99)
- System automatically:
  - Marks match as finished
  - Calculates points for all predictions (see GAME-RULES.md)
  - Updates leaderboard
  - Awards weekly bonuses (if week complete)

#### FR-RESULT-2: Update Match Results
- Admin can correct entered results
- System recalculates:
  - All affected prediction points
  - Leaderboard positions
  - Weekly bonuses

---

### 2.3 Prediction Submission (User)

#### FR-PREDICT-1: View Upcoming Matches
- Users see all upcoming matches:
  - Home team vs Away team
  - Kickoff date & time (local timezone)
  - Tournament stage
  - Prediction status (submitted/not submitted)
- Sorted by kickoff time (ascending)
- Filter by game week

#### FR-PREDICT-2: Submit Predictions
- Users submit predictions before kickoff:
  - Home score (0-9)
  - Away score (0-9)
- Validation:
  - Both scores required
  - Integer values only
  - Cannot submit after kickoff
- Confirmation message on success

#### FR-PREDICT-3: Update Predictions
- Users can update predictions before kickoff
- Cannot modify after kickoff deadline
- Show "locked" indicator after deadline

#### FR-PREDICT-4: View My Predictions
- Users see all their predictions:
  - Past predictions with points earned
  - Upcoming predictions (editable)
  - Matches without predictions
- Show actual results for finished matches

---

### 2.4 Scoring System

#### FR-SCORE-1: Calculate Points
- System calculates points using official rules (see GAME-RULES.md)
- Base points (0-5) calculated first
- Then multiplied by stage multiplier (1x-5x)
- **Implementation MUST match reference code in GAME-RULES.md**

#### FR-SCORE-2: Weekly Bonuses
- System awards weekly bonuses:
  - 1st place: +5 points
  - 2nd place: +3 points
  - 3rd place: +1 point
- Ties split bonus equally
- Bonuses calculated when all week matches finished

#### FR-SCORE-3: Season Predictions (Future)
- Users predict before tournament:
  - Winner (50 points)
  - Runner-up (35 points)
  - Top scorer (25 points)
- Locked after first match kickoff
- Points awarded at tournament end

---

### 2.5 Leaderboard & Statistics

#### FR-LEADER-1: Overall Leaderboard
- Show all users ranked by total points:
  - Rank
  - Username
  - Total points
  - Predictions made
  - Exact scores
  - Correct winners
- Tie-breaking: exact scores → correct winners → username

#### FR-LEADER-2: Weekly Leaderboard
- Show users ranked by week points:
  - Current week highlighted
  - Historical weeks available
  - Points before bonuses
  - Weekly bonus awarded
- Dropdown to select week

#### FR-LEADER-3: User Statistics
- User profile shows:
  - Overall rank
  - Total points
  - Predictions made / Total matches
  - Accuracy breakdown:
    - Exact scores (5 pts)
    - Winner + diff (4 pts)
    - Correct winner (3 pts)
    - One score (1 pt)
    - Misses (0 pts)
  - Weekly performance history (chart)
  - Best week / Worst week

#### FR-LEADER-4: Match Statistics
- For finished matches, show:
  - How many users predicted exact score
  - Most common prediction
  - Average points earned
  - Leaderboard impact

---

### 2.6 Progressive Web App Features

#### FR-PWA-1: Install Prompt
- Users can install app to home screen
- Native app-like experience
- App icon, splash screen, theme color

#### FR-PWA-2: Offline Functionality
- View cached leaderboard data offline
- View own predictions offline
- Queue prediction submissions when offline
- Sync when connection restored

#### FR-PWA-3: Push Notifications (Future)
- Notify users:
  - 24h before game week deadline
  - 1h before match kickoff
  - When results are entered
  - When weekly bonuses awarded

---

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-PERF-1: Page Load Times
- Initial page load: < 2 seconds (4G mobile)
- Route transitions: < 500ms
- API response time: < 300ms (p95)

#### NFR-PERF-2: Scalability
- Support 100 concurrent users
- Handle 1000 predictions per game week
- Database queries optimized with indexes

#### NFR-PERF-3: PWA Performance
- Lighthouse score:
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90
  - PWA: 100

---

### 3.2 Security

#### NFR-SEC-1: Authentication Security
- JWT tokens with RS256 signing
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration with rotation
- HttpOnly, Secure cookies for token storage
- CSRF protection with SameSite cookies

#### NFR-SEC-2: Authorization Security
- Role-based access control (RBAC)
- Admin endpoints protected with `[Authorize(Roles = "ADMIN")]`
- Input validation on all endpoints
- Prevent IDOR/BOLA attacks

#### NFR-SEC-3: Data Protection
- HTTPS only (TLS 1.3)
- Passwords hashed with bcrypt (work factor 12)
- No sensitive data in logs
- SQL injection prevention (parameterized queries)
- XSS prevention (Content Security Policy)

#### NFR-SEC-4: Security Headers
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin

---

### 3.3 Usability

#### NFR-UX-1: Mobile-First Design
- Responsive layout (320px - 2560px)
- Touch-friendly controls (44px minimum)
- Fast tap response (< 100ms)
- Swipe gestures for navigation

#### NFR-UX-2: Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast (4.5:1)

#### NFR-UX-3: Internationalization (Future)
- Estonian language support
- Date/time in user's timezone
- Number formatting (locale-aware)

---

### 3.4 Reliability

#### NFR-REL-1: Uptime
- 99.5% uptime during active tournaments
- Scheduled maintenance windows (off-season)

#### NFR-REL-2: Data Integrity
- Database transactions (ACID compliance)
- Foreign key constraints
- Point calculation validation
- Automated backups (daily)

#### NFR-REL-3: Error Handling
- Graceful degradation
- User-friendly error messages
- Retry logic for transient failures
- Logging with correlation IDs

---

### 3.5 Maintainability

#### NFR-MAINT-1: Code Quality
- Follow SOLID principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Comprehensive inline documentation

#### NFR-MAINT-2: Testing
- Backend unit test coverage: > 80%
- Frontend component test coverage: > 70%
- Integration tests for critical flows
- E2E tests for user journeys

#### NFR-MAINT-3: DevOps
- CI/CD pipeline (GitHub Actions)
- Automated builds and tests
- Database migration scripts (Entity Framework)
- Environment-based configuration

---

## 4. Technical Constraints

### 4.1 Technology Stack

#### Backend: .NET 9
- ASP.NET Core Web API
- Entity Framework Core 9
- PostgreSQL 16+
- Identity framework for authentication
- Serilog for structured logging
- FluentValidation for input validation
- AutoMapper for DTO mapping
- Swagger/OpenAPI for documentation

#### Frontend: Angular 19
- TypeScript 5.7+
- Angular Material or Tailwind CSS
- RxJS for reactive programming
- Angular PWA service worker
- NgRx or Signals for state management
- HttpClient with interceptors
- Angular Router with guards

#### Database: PostgreSQL 16
- Primary data store
- Flyway or EF migrations
- Indexes for performance
- JSON columns for flexibility

#### Hosting
- Backend: Azure App Service or Railway
- Frontend: Vercel or Netlify
- Database: Azure Database for PostgreSQL

---

### 4.2 Integration Requirements

#### API Integration
- Optional: football-data.org API
  - Match schedules
  - Live scores (future)
- Rate limiting: 10 requests/minute

#### Email Service (Future)
- SendGrid or Mailgun
- Transactional emails:
  - Password reset
  - Weekly reminders
  - Result notifications

---

## 5. User Stories

### 5.1 Player User Stories

**US-1**: As a player, I want to quickly submit predictions on my phone so I don't miss deadlines
**US-2**: As a player, I want to see the leaderboard to track my ranking against friends
**US-3**: As a player, I want to view my prediction history to see where I earned/lost points
**US-4**: As a player, I want to know which matches I haven't predicted yet
**US-5**: As a player, I want to see other players' predictions after matches finish
**US-6**: As a player, I want to install the app on my home screen for quick access
**US-7**: As a player, I want to receive notifications before deadlines
**US-8**: As a player, I want to view statistics about my accuracy

---

### 5.2 Admin User Stories

**US-9**: As an admin, I want to create tournaments and game weeks
**US-10**: As an admin, I want to import matches from an API to save time
**US-11**: As an admin, I want to quickly enter match results
**US-12**: As an admin, I want to see points calculated automatically
**US-13**: As an admin, I want to correct mistakes without manual recalculations
**US-14**: As an admin, I want to view system statistics and user activity

---

## 6. Data Model

### 6.1 Core Entities

#### User
```csharp
public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } // unique, 3-20 chars
    public string Email { get; set; } // unique, valid email
    public string PasswordHash { get; set; } // bcrypt
    public UserRole Role { get; set; } // USER or ADMIN
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation
    public ICollection<Prediction> Predictions { get; set; }
}
```

#### Tournament
```csharp
public class Tournament
{
    public Guid Id { get; set; }
    public string Name { get; set; } // "Champions League 2024/25"
    public string Season { get; set; } // "2024/25"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }

    // Navigation
    public ICollection<GameWeek> GameWeeks { get; set; }
}
```

#### GameWeek
```csharp
public class GameWeek
{
    public Guid Id { get; set; }
    public Guid TournamentId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Navigation
    public Tournament Tournament { get; set; }
    public ICollection<Match> Matches { get; set; }
}
```

#### Match
```csharp
public class Match
{
    public Guid Id { get; set; }
    public Guid GameWeekId { get; set; }
    public string HomeTeam { get; set; }
    public string AwayTeam { get; set; }
    public DateTime KickoffTime { get; set; } // UTC
    public TournamentStage Stage { get; set; } // enum
    public int? HomeScore { get; set; } // nullable until finished
    public int? AwayScore { get; set; }
    public bool IsFinished { get; set; }

    // Computed
    public int StageMultiplier => Stage.GetMultiplier();

    // Navigation
    public GameWeek GameWeek { get; set; }
    public ICollection<Prediction> Predictions { get; set; }
}
```

#### Prediction
```csharp
public class Prediction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MatchId { get; set; }
    public int HomeScore { get; set; } // 0-9
    public int AwayScore { get; set; } // 0-9
    public int? PointsEarned { get; set; } // null until match finished
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; }
    public Match Match { get; set; }
}
```

#### TournamentStage (Enum)
```csharp
public enum TournamentStage
{
    GROUP_STAGE = 1,
    ROUND_OF_16 = 2,
    QUARTER_FINALS = 3,
    SEMI_FINALS = 4,
    FINAL = 5
}

public static class TournamentStageExtensions
{
    public static int GetMultiplier(this TournamentStage stage)
    {
        return (int)stage;
    }
}
```

---

### 6.2 Database Indexes

```sql
-- User indexes
CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
CREATE UNIQUE INDEX IX_Users_Username ON Users(Username);

-- Match indexes
CREATE INDEX IX_Matches_GameWeekId ON Matches(GameWeekId);
CREATE INDEX IX_Matches_KickoffTime ON Matches(KickoffTime);
CREATE INDEX IX_Matches_IsFinished ON Matches(IsFinished);

-- Prediction indexes
CREATE INDEX IX_Predictions_UserId ON Predictions(UserId);
CREATE INDEX IX_Predictions_MatchId ON Predictions(MatchId);
CREATE UNIQUE INDEX IX_Predictions_UserId_MatchId ON Predictions(UserId, MatchId);
```

---

## 7. API Endpoints

### 7.1 Authentication Endpoints

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login user
POST   /api/v1/auth/refresh           Refresh access token
POST   /api/v1/auth/logout            Logout user
GET    /api/v1/auth/me                Get current user
PUT    /api/v1/auth/change-password   Change password
```

### 7.2 Tournament Endpoints (Admin)

```
POST   /api/v1/admin/tournaments             Create tournament
GET    /api/v1/admin/tournaments             List all tournaments
GET    /api/v1/admin/tournaments/{id}        Get tournament by ID
PUT    /api/v1/admin/tournaments/{id}        Update tournament
DELETE /api/v1/admin/tournaments/{id}        Delete tournament
```

### 7.3 Game Week Endpoints (Admin)

```
POST   /api/v1/admin/gameweeks                    Create game week
GET    /api/v1/admin/tournaments/{id}/gameweeks   List game weeks
GET    /api/v1/admin/gameweeks/{id}               Get game week by ID
PUT    /api/v1/admin/gameweeks/{id}               Update game week
```

### 7.4 Match Endpoints

```
GET    /api/v1/matches/upcoming           Get upcoming matches
GET    /api/v1/matches/{id}               Get match details
GET    /api/v1/matches/gameweek/{id}      Get matches by game week

POST   /api/v1/admin/matches              Create match (admin)
PUT    /api/v1/admin/matches/{id}         Update match (admin)
PUT    /api/v1/admin/matches/{id}/result  Enter result (admin)
POST   /api/v1/admin/gameweeks/{id}/import-matches  Import from API (admin)
```

### 7.5 Prediction Endpoints

```
GET    /api/v1/predictions/my             Get my predictions
GET    /api/v1/predictions/match/{id}     Get match predictions
POST   /api/v1/predictions                Submit prediction
PUT    /api/v1/predictions/{id}           Update prediction
```

### 7.6 Leaderboard Endpoints

```
GET    /api/v1/leaderboard/overall        Overall leaderboard
GET    /api/v1/leaderboard/weekly/{id}    Weekly leaderboard
GET    /api/v1/leaderboard/user/{id}      User statistics
```

---

## 8. MVP Scope (Phase 1)

### Must Have
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Admin tournament/game week/match creation
- ✅ Prediction submission and updates
- ✅ Correct scoring calculation (GAME-RULES.md)
- ✅ Overall leaderboard
- ✅ Weekly leaderboard
- ✅ Mobile-responsive UI
- ✅ PWA installation capability

### Should Have (Phase 2)
- Weekly bonus automation
- Email notifications
- Match import from API
- User statistics dashboard
- Push notifications

### Could Have (Phase 3)
- Season predictions
- Historical data charts
- Social features (comments)
- Dark mode
- Estonian language
- Real-time updates (SignalR)

---

## 9. Success Criteria

### 9.1 User Satisfaction
- >80% weekly participation rate
- Positive feedback on ease of use
- Zero complaints about incorrect scoring

### 9.2 Technical Success
- Zero data loss incidents
- <5 bug reports per month
- 99.5% uptime during tournaments
- Lighthouse PWA score: 100

### 9.3 Business Goals
- Successfully complete one full tournament season
- Reduce admin time to <5 minutes per week
- Foundation for multiple friend groups

---

## 10. Assumptions and Constraints

### 10.1 Assumptions
- Users have smartphones with modern browsers
- Internet connectivity available during prediction windows
- Tournament schedules published in advance
- Match results available shortly after games

### 10.2 Dependencies
- Hosting service availability (Azure/Railway)
- Domain name and SSL certificate
- Email service provider (future)
- football-data.org API availability (optional)

---

## 11. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Users miss prediction deadlines | High | Medium | Email/push notifications 24h before |
| Server downtime during matches | High | Low | Choose reliable hosting, monitoring |
| Scoring calculation bugs | Critical | Low | Comprehensive tests, match reference code |
| Low user adoption | Medium | Low | Simple UX, involve users in testing |
| Data loss | Critical | Low | Daily automated backups |
| API rate limits | Low | Medium | Cache results, manual entry fallback |

---

## 12. Future Enhancements

- Native mobile apps (iOS/Android)
- Live match tracking with real-time updates
- Machine learning prediction baseline
- Multi-tournament support (Europa League, World Cup)
- Advanced analytics dashboard
- Export data to Excel/CSV
- Multiple language support
- Integration with betting odds

---

**Version**: 1.0
**Author**: System Specification
**Created**: 2025-01-27
**Status**: Draft for Development
**Based On**: Spring Boot + React (Correct Implementation)
