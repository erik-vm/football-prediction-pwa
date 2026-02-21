# Flutter App Analysis - Feature Gap Assessment

**Date**: 2026-02-21
**Source**: C:\Projects\taltech\icd0011exercises\football_prediction_app
**Current Implementation**: C:\Projects\football-prediction-pwa

---

## Executive Summary

The Flutter application is a **production-ready, feature-complete** mobile app with sophisticated offline-first architecture, real-time updates, and integration with football-data.org API. The current .NET/Angular PWA implementation is missing **critical features** that make the app functional and usable.

---

## Critical Missing Features

### 🔴 Priority 1 - CRITICAL (Blocks Core Functionality)

1. **football-data.org API Integration**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Impact**: No real match data - app is non-functional without this
   - **Details**:
     - API: `https://api.football-data.org/v4`
     - Auth: X-Auth-Token header
     - Endpoints: `/competitions/{code}/matches`
     - 12 supported competitions (Premier League, Champions League, etc.)

2. **Automatic Match Result Processing**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Impact**: Points never calculated - leaderboards don't work
   - **Details**: Background job to:
     - Detect finished matches
     - Calculate points for all predictions
     - Update user statistics
     - Refresh leaderboards

3. **Points Calculation System**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Algorithm**:
     - Exact score: +5 points
     - Correct winner/draw: +3 points
     - Correct goal difference: +2 points
     - Wrong prediction: 0 points

### 🟡 Priority 2 - HIGH (Core Features Missing)

4. **Competition-Specific Leaderboards**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Current**: Single global leaderboard
   - **Required**: Separate leaderboards per competition
   - **Impact**: Users can't compete in specific leagues

5. **User Competition Preferences**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Current**: All matches shown to all users
   - **Required**: Users select which competitions to follow
   - **Impact**: Information overload - too many matches

6. **Matchday Filtering**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Required**: Group and filter matches by matchday number
   - **Impact**: Hard to find relevant matches in long seasons

7. **Match Status Tabs**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Current**: Single list of all matches
   - **Required**: 3 tabs - Upcoming | Live | Completed
   - **Impact**: Poor UX - can't easily see what's happening now

8. **User Statistics Display**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Required**: Stats card showing:
     - Current rank
     - Total points
     - Total predictions
     - Accuracy percentage

### 🔵 Priority 3 - MEDIUM (Enhanced Functionality)

9. **Offline-First Architecture**
   - **Status**: ❌ NOT IMPLEMENTED
   - **Flutter**: IndexedDB cache + background sync
   - **Impact**: App doesn't work offline

10. **Real-time Leaderboard Updates**
    - **Status**: ❌ NOT IMPLEMENTED
    - **Flutter**: SignalR/WebSocket streams
    - **Current**: Manual refresh required

11. **Prediction Deadline Countdown**
    - **Status**: ⚠️ PARTIAL (need to verify)
    - **Required**: Live countdown timer showing time until kickoff

12. **Match Venue Display**
    - **Status**: ❌ NOT IMPLEMENTED
    - **Required**: Show stadium/venue on match cards

---

## Current vs Required Architecture

### Data Models Comparison

#### Flutter App (Complete)
```typescript
Match {
  id: string
  homeTeam: string
  awayTeam: string
  matchDate: DateTime
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED'
  competitionCode: string      // ← Missing in current
  homeScore?: number
  awayScore?: number
  venue?: string               // ← Missing in current
  matchday?: number            // ← Missing in current
}

Prediction {
  id: string
  userId: string
  matchId: string
  competitionCode: string      // ← Missing in current
  homeScore: number
  awayScore: number
  createdAt: DateTime
  updatedAt: DateTime
  pointsEarned?: number        // ← Missing in current
  status: 'PENDING' | 'SCORED' // ← Missing in current
}

LeaderboardEntry {
  userId: string
  displayName: string
  competitionCode: string      // ← Missing in current
  totalPoints: number
  totalPredictions: number
  accuracy: number             // ← Missing in current
  rank: number
}

UserSettings {                 // ← Entire model missing
  userId: string
  selectedCompetitions: string[]
}
```

#### Current Implementation (Incomplete)
- ✅ Basic Match model
- ✅ Basic Prediction model
- ✅ Basic User model
- ❌ No competition tracking
- ❌ No matchday support
- ❌ No venue support
- ❌ No points earned tracking
- ❌ No user settings/preferences
- ❌ No accuracy calculation

---

## API Integration Requirements

### football-data.org API Setup

**Endpoint**: `GET https://api.football-data.org/v4/competitions/{code}/matches`

**Headers**:
```
X-Auth-Token: 2c778464a60e4b51b2407fcc62539791
```

**Query Parameters**:
```
status: SCHEDULED,TIMED,IN_PLAY,PAUSED,FINISHED
dateFrom: {90 days ago}
dateTo: {90 days future}
```

**Supported Competitions** (Free Tier - 12):
```
PL    - Premier League
CL    - UEFA Champions League
BL1   - Bundesliga
SA    - Serie A
PD    - La Liga
FL1   - Ligue 1
DED   - Eredivisie
PPL   - Primeira Liga
ELC   - Championship
BSA   - Brasileirão Serie A
WC    - FIFA World Cup
EC    - UEFA European Championship
```

**Response Mapping**:
```json
{
  "matches": [
    {
      "id": 123456,
      "utcDate": "2026-02-22T15:00:00Z",
      "status": "SCHEDULED",
      "matchday": 25,
      "homeTeam": { "name": "Arsenal FC" },
      "awayTeam": { "name": "Liverpool FC" },
      "score": {
        "fullTime": { "home": null, "away": null }
      },
      "venue": "Emirates Stadium"
    }
  ]
}
```

**Status Conversion**:
- `SCHEDULED, TIMED` → `SCHEDULED`
- `IN_PLAY, PAUSED` → `LIVE`
- `FINISHED` → `FINISHED`

---

## Business Logic Requirements

### 1. Points Calculation Algorithm

```csharp
public static int CalculatePoints(
    int predictedHome, int predictedAway,
    int actualHome, int actualAway)
{
    // Check exact score
    if (predictedHome == actualHome && predictedAway == actualAway)
        return 5;

    // Check correct goal difference
    int predictedDiff = predictedHome - predictedAway;
    int actualDiff = actualHome - actualAway;

    if (predictedDiff == actualDiff)
        return 2;

    // Check correct winner/draw
    int predictedResult = Math.Sign(predictedDiff);
    int actualResult = Math.Sign(actualDiff);

    if (predictedResult == actualResult)
        return 3;

    return 0;
}
```

### 2. Accuracy Calculation

```csharp
public static double CalculateAccuracy(int totalPoints, int totalPredictions)
{
    if (totalPredictions == 0) return 0.0;

    int maxPossiblePoints = totalPredictions * 5;
    return (double)totalPoints / maxPossiblePoints * 100.0;
}
```

### 3. Automatic Result Processing Flow

```
Background Job (runs every 5 minutes):
1. Query matches with status = 'FINISHED' and not processed
2. For each finished match:
   a. Fetch all predictions for this match
   b. Calculate points for each prediction using algorithm
   c. Update Prediction.pointsEarned and status = 'SCORED'
   d. Update user's competition-specific statistics:
      - Increment totalPredictions
      - Add to totalPoints
      - Recalculate accuracy
   e. Mark match as processed
3. Trigger leaderboard refresh via SignalR
```

---

## Database Schema Updates Required

### New Tables

```sql
-- Competition master data
CREATE TABLE Competitions (
    Code VARCHAR(10) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Emblem NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User competition preferences
CREATE TABLE UserCompetitionPreferences (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    CompetitionCode VARCHAR(10) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (CompetitionCode) REFERENCES Competitions(Code),
    UNIQUE (UserId, CompetitionCode)
);

-- Competition-specific user statistics
CREATE TABLE UserCompetitionStats (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    CompetitionCode VARCHAR(10) NOT NULL,
    TotalPoints INT DEFAULT 0,
    TotalPredictions INT DEFAULT 0,
    Accuracy DECIMAL(5,2) DEFAULT 0.00,
    Rank INT,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (CompetitionCode) REFERENCES Competitions(Code),
    UNIQUE (UserId, CompetitionCode)
);

-- Match processing status
CREATE TABLE MatchProcessingStatus (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MatchId UNIQUEIDENTIFIER NOT NULL,
    ProcessedAt TIMESTAMP NOT NULL,
    PredictionsProcessed INT NOT NULL,
    FOREIGN KEY (MatchId) REFERENCES Matches(Id),
    UNIQUE (MatchId)
);
```

### Schema Modifications

```sql
-- Add columns to Matches table
ALTER TABLE Matches
ADD CompetitionCode VARCHAR(10),
    Venue NVARCHAR(200),
    Matchday INT;

-- Add foreign key
ALTER TABLE Matches
ADD CONSTRAINT FK_Matches_Competitions
FOREIGN KEY (CompetitionCode) REFERENCES Competitions(Code);

-- Add columns to Predictions table
ALTER TABLE Predictions
ADD CompetitionCode VARCHAR(10),
    PointsEarned INT,
    Status VARCHAR(20) DEFAULT 'PENDING';

-- Add indexes for performance
CREATE INDEX IDX_Matches_CompetitionCode ON Matches(CompetitionCode);
CREATE INDEX IDX_Matches_Status ON Matches(Status);
CREATE INDEX IDX_Matches_Matchday ON Matches(CompetitionCode, Matchday);
CREATE INDEX IDX_Predictions_Status ON Predictions(Status);
CREATE INDEX IDX_UserCompetitionStats_Competition ON UserCompetitionStats(CompetitionCode, TotalPoints DESC);
```

---

## Frontend Components Required

### New Components

1. **CompetitionSelectorComponent**
   - Dropdown to switch between competitions
   - Shows competition name + emblem
   - Filters matches and leaderboards

2. **MatchStatusTabsComponent**
   - 3 tabs: Upcoming | Live | Completed
   - Badge counts for each tab
   - Auto-refresh for Live tab

3. **MatchdayFilterComponent**
   - Dropdown showing available matchdays
   - Groups matches by matchday number

4. **UserStatsCardComponent**
   - Displays personal statistics
   - Shows rank with visual indicator
   - Points, predictions, accuracy

5. **CompetitionPreferencesComponent**
   - Multi-select checkboxes for 12 competitions
   - Save preferences to backend
   - Filter home feed

### Component Updates

1. **MatchCardComponent** - Add:
   - Venue display
   - Matchday badge
   - User's prediction display
   - Points earned (if finished)

2. **LeaderboardComponent** - Add:
   - Competition selector
   - User stats card at top
   - Medal icons for top 3
   - Accuracy column

3. **PredictionFormComponent** - Add:
   - Live countdown timer
   - Points breakdown info
   - Deadline enforcement

---

## API Endpoints Required

### New Backend Endpoints

```typescript
// Competitions
GET    /api/v1/competitions
GET    /api/v1/competitions/{code}
POST   /api/v1/competitions/sync  // Sync from football-data.org

// Match Data Sync
POST   /api/v1/matches/sync/{competitionCode}  // Fetch from API
GET    /api/v1/matches/upcoming?competitionCode={code}&matchday={number}
GET    /api/v1/matches/live?competitionCode={code}
GET    /api/v1/matches/completed?competitionCode={code}&matchday={number}

// User Preferences
GET    /api/v1/users/me/preferences
PUT    /api/v1/users/me/preferences
POST   /api/v1/users/me/preferences/competitions

// Competition Statistics
GET    /api/v1/leaderboard/{competitionCode}
GET    /api/v1/users/me/stats/{competitionCode}
GET    /api/v1/users/{userId}/stats/{competitionCode}

// Background Jobs (Admin)
POST   /api/v1/admin/process-results  // Trigger result processing
GET    /api/v1/admin/processing-status
```

---

## Implementation Phases

### Phase 13: Football-Data.org API Integration (CRITICAL)
**Priority**: 🔴 P0 - Must have for app to function

**Backend**:
- Create Competition entity and configuration
- Implement FootballDataService for API calls
- Create match sync background job
- Add competition CRUD endpoints
- Seed 12 competitions into database

**Frontend**:
- Create Competition model
- Implement CompetitionService
- Add competition selector component
- Update match display to show competition

**Testing**:
- Verify API connection
- Test match data sync
- Confirm 12 competitions load

---

### Phase 14: Automatic Result Processing (CRITICAL)
**Priority**: 🔴 P0 - Points system doesn't work without this

**Backend**:
- Implement PointsCalculator service
- Create MatchResultProcessor background job
- Add UserCompetitionStats tracking
- Update prediction entity with points/status
- Add processing status tracking

**Frontend**:
- Update prediction display to show points
- Add processing status indicators
- Show accuracy percentage

**Testing**:
- Test points calculation algorithm
- Verify statistics update correctly
- Test with multiple competitions

---

### Phase 15: Competition-Specific Features (HIGH)
**Priority**: 🟡 P1 - Core UX improvements

**Backend**:
- UserCompetitionPreferences entity
- Leaderboard filtering by competition
- User statistics per competition
- Preference endpoints

**Frontend**:
- Competition preferences component
- Filtered leaderboards
- User stats card
- Match filtering by user preferences

**Testing**:
- Test preference saving
- Verify filtered leaderboards
- Test stats accuracy

---

### Phase 16: Match Organization & Filtering (HIGH)
**Priority**: 🟡 P1 - Essential for usability

**Frontend**:
- Match status tabs (Upcoming/Live/Completed)
- Matchday filter dropdown
- Grouped match display
- Tab badge counts

**Backend**:
- Add matchday filtering to queries
- Optimize match queries with indexes

**Testing**:
- Test tab switching
- Verify matchday filtering
- Test performance with large datasets

---

### Phase 17: Real-time Updates & Enhancements (MEDIUM)
**Priority**: 🔵 P2 - Nice to have

**Backend**:
- SignalR hub for real-time updates
- Leaderboard change notifications
- Live match score updates

**Frontend**:
- SignalR client integration
- Live countdown timers
- Auto-refresh for live matches
- Venue display

**Testing**:
- Test real-time leaderboard updates
- Verify countdown accuracy
- Test SignalR reconnection

---

### Phase 18: Offline Support & PWA Enhancements (MEDIUM)
**Priority**: 🔵 P2 - PWA optimization

**Frontend**:
- IndexedDB for match caching
- Service worker updates
- Offline prediction queue
- Background sync

**Testing**:
- Test offline mode
- Verify sync on reconnect
- Test PWA install flow

---

## Success Criteria

### Phase 13 Complete When:
- ✅ All 12 competitions loaded from football-data.org
- ✅ Matches sync automatically every hour
- ✅ Competition selector shows all leagues
- ✅ Match cards display competition emblem

### Phase 14 Complete When:
- ✅ Finished matches auto-calculate points
- ✅ User statistics update automatically
- ✅ Leaderboards reflect current points
- ✅ Accuracy percentage shows correctly

### Phase 15 Complete When:
- ✅ Users can select preferred competitions
- ✅ Home feed filters by preferences
- ✅ Each competition has separate leaderboard
- ✅ Stats tracked per competition

### Phase 16 Complete When:
- ✅ 3 tabs working (Upcoming/Live/Completed)
- ✅ Matchday filter functional
- ✅ Matches grouped correctly
- ✅ Badge counts accurate

### Phase 17 Complete When:
- ✅ Leaderboard updates in real-time
- ✅ Live match scores refresh automatically
- ✅ Countdown timers work
- ✅ Venue displays on cards

### Phase 18 Complete When:
- ✅ App works offline
- ✅ Predictions queue when offline
- ✅ Auto-sync on reconnect
- ✅ PWA installable

---

## Risk Assessment

### High Risk Items:
1. **football-data.org API Rate Limits**
   - Free tier: 10 requests/minute
   - Mitigation: Implement caching, batch requests

2. **Background Job Performance**
   - Processing 1000s of predictions per match
   - Mitigation: Batch processing, database indexes

3. **Real-time Scaling**
   - SignalR connections for many users
   - Mitigation: Use Redis backplane, load balancing

### Medium Risk Items:
4. **Offline Sync Conflicts**
   - Multiple devices editing same prediction
   - Mitigation: Last-write-wins, timestamp comparison

5. **Data Consistency**
   - Competition stats vs individual predictions
   - Mitigation: Transactions, periodic reconciliation

---

## Estimated Effort

| Phase | Backend | Frontend | Testing | Total |
|-------|---------|----------|---------|-------|
| 13: API Integration | 8h | 4h | 2h | 14h |
| 14: Result Processing | 6h | 3h | 3h | 12h |
| 15: Competition Features | 5h | 6h | 2h | 13h |
| 16: Match Organization | 2h | 6h | 2h | 10h |
| 17: Real-time Updates | 4h | 5h | 2h | 11h |
| 18: Offline Support | 2h | 8h | 3h | 13h |
| **TOTAL** | **27h** | **32h** | **14h** | **73h** |

---

## Next Steps

1. ✅ Complete this analysis document
2. ⏭️ Update PROGRESS.md with new phases
3. ⏭️ Create detailed specs for Phase 13
4. ⏭️ Commit all analysis documents
5. ⏭️ Begin Phase 13 implementation

---

**End of Analysis**
