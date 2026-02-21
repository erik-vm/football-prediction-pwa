# Implementation Plan V2 - Missing Features

**Created**: 2026-02-21
**Based on**: Flutter App Analysis
**Status**: Ready to Execute

---

## Overview

After analyzing the reference Flutter application, we've identified **6 critical missing phases** (Phases 13-18) that must be implemented to achieve feature parity. The current implementation (Phases 0-12) provides basic infrastructure but lacks the core functionality that makes the app usable.

---

## Phase 13: Football-Data.org API Integration ⚡ CRITICAL

### Priority: 🔴 P0 (Blocks Everything)
**Estimated Time**: 14 hours (8h backend, 4h frontend, 2h testing)

### Why Critical?
Without real match data from football-data.org, the app has no matches to predict on. This is the foundation for all other features.

### Backend Tasks

1. **Create Competition Entity**
```csharp
public class Competition
{
    public string Code { get; set; } // PK: "PL", "CL", etc.
    public string Name { get; set; }
    public string? Emblem { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

2. **Implement FootballDataService**
- API base URL: `https://api.football-data.org/v4`
- API key: `2c778464a60e4b51b2407fcc62539791`
- Methods:
  - `GetMatchesAsync(competitionCode, dateFrom, dateTo)`
  - `GetCompetitionsAsync()`
  - `MapApiStatusToAppStatus(apiStatus)`

3. **Create MatchSyncBackgroundJob**
- Runs every 1 hour using Quartz.NET or Hangfire
- Fetches matches for all active competitions
- Updates existing matches (status, scores)
- Inserts new matches
- Logs sync results

4. **Update Match Entity**
```csharp
// Add properties:
public string CompetitionCode { get; set; }
public string? Venue { get; set; }
public int? Matchday { get; set; }
```

5. **Add API Endpoints**
```
GET  /api/v1/competitions
GET  /api/v1/competitions/{code}
POST /api/v1/admin/sync-matches/{competitionCode}
GET  /api/v1/matches?competitionCode={code}&status={status}&matchday={number}
```

6. **Seed Competitions**
```sql
INSERT INTO Competitions VALUES
('PL', 'Premier League', 'url', 1),
('CL', 'UEFA Champions League', 'url', 1),
('BL1', 'Bundesliga', 'url', 1),
('SA', 'Serie A', 'url', 1),
('PD', 'La Liga', 'url', 1),
('FL1', 'Ligue 1', 'url', 1),
('DED', 'Eredivisie', 'url', 1),
('PPL', 'Primeira Liga', 'url', 1),
('ELC', 'Championship', 'url', 1),
('BSA', 'Brasileirão', 'url', 1),
('WC', 'FIFA World Cup', 'url', 1),
('EC', 'European Championship', 'url', 1);
```

### Frontend Tasks

1. **Create Competition Model**
```typescript
export interface Competition {
  code: string;
  name: string;
  emblem?: string;
  isActive: boolean;
}
```

2. **Create CompetitionService**
```typescript
getCompetitions(): Observable<Competition[]>
selectCompetition(code: string): void
currentCompetition: Signal<Competition | null>
```

3. **Create CompetitionSelectorComponent**
- Dropdown showing all 12 competitions
- Displays competition name + emblem
- Emits selection change event
- Stores selection in service

4. **Update MatchService**
- Add competition filter to queries
- Cache matches per competition
- Auto-refresh every 5 minutes for live matches

5. **Update Match Card Display**
- Show competition emblem/badge
- Display matchday number
- Add venue information

### Testing

- ✅ API connection successful
- ✅ All 12 competitions loaded
- ✅ Matches sync from API
- ✅ Match statuses map correctly
- ✅ Competition selector works
- ✅ Match cards show competition info

### Acceptance Criteria

- User can switch between 12 competitions
- Matches load automatically every hour
- Live matches update every 5 minutes
- Competition emblem displays on match cards
- Venue and matchday show correctly

---

## Phase 14: Automatic Result Processing ⚡ CRITICAL

### Priority: 🔴 P0 (Points Don't Work Without This)
**Estimated Time**: 12 hours (6h backend, 3h frontend, 3h testing)

### Why Critical?
Currently, when matches finish, points are NEVER calculated. Leaderboards remain empty. This is a complete blocker for the core prediction game functionality.

### Backend Tasks

1. **Create PointsCalculator Service**
```csharp
public static class PointsCalculator
{
    public static int Calculate(
        int predictedHome, int predictedAway,
        int actualHome, int actualAway)
    {
        // Exact score
        if (predictedHome == actualHome && predictedAway == actualAway)
            return 5;

        // Correct goal difference
        int predDiff = predictedHome - predictedAway;
        int actualDiff = actualHome - actualAway;
        if (predDiff == actualDiff)
            return 2;

        // Correct winner/draw
        if (Math.Sign(predDiff) == Math.Sign(actualDiff))
            return 3;

        return 0;
    }
}
```

2. **Update Prediction Entity**
```csharp
public int? PointsEarned { get; set; }
public string Status { get; set; } // "PENDING" or "SCORED"
public string CompetitionCode { get; set; }
```

3. **Create UserCompetitionStats Entity**
```csharp
public class UserCompetitionStats
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CompetitionCode { get; set; }
    public int TotalPoints { get; set; }
    public int TotalPredictions { get; set; }
    public decimal Accuracy { get; set; }
    public int? Rank { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; }
    public Competition Competition { get; set; }
}
```

4. **Create MatchResultProcessor Background Job**
```csharp
public class MatchResultProcessor : IBackgroundJob
{
    public async Task ProcessFinishedMatches()
    {
        // 1. Get all finished, unprocessed matches
        var matches = await _matchRepo.GetUnprocessedFinishedMatches();

        foreach (var match in matches)
        {
            // 2. Get all predictions for this match
            var predictions = await _predictionRepo
                .GetByMatchId(match.Id);

            // 3. Calculate points for each
            foreach (var prediction in predictions)
            {
                var points = PointsCalculator.Calculate(
                    prediction.HomeScore,
                    prediction.AwayScore,
                    match.HomeScore.Value,
                    match.AwayScore.Value
                );

                prediction.PointsEarned = points;
                prediction.Status = "SCORED";
            }

            await _predictionRepo.UpdateRange(predictions);

            // 4. Update user statistics
            await UpdateUserStats(predictions);

            // 5. Mark match as processed
            await _matchRepo.MarkAsProcessed(match.Id);

            // 6. Notify via SignalR (optional)
            await _hub.Clients.All.SendAsync("LeaderboardUpdated");
        }
    }

    private async Task UpdateUserStats(List<Prediction> predictions)
    {
        var grouped = predictions.GroupBy(p =>
            new { p.UserId, p.CompetitionCode });

        foreach (var group in grouped)
        {
            var stats = await _statsRepo.GetOrCreate(
                group.Key.UserId,
                group.Key.CompetitionCode
            );

            stats.TotalPredictions += group.Count();
            stats.TotalPoints += group.Sum(p => p.PointsEarned ?? 0);
            stats.Accuracy = CalculateAccuracy(
                stats.TotalPoints,
                stats.TotalPredictions
            );
            stats.UpdatedAt = DateTime.UtcNow;

            await _statsRepo.Update(stats);
        }

        // Recalculate ranks
        await RecalculateRanks(group.First().CompetitionCode);
    }
}
```

5. **Schedule Background Job**
- Runs every 5 minutes
- Checks for finished matches
- Processes in batches of 100 predictions

6. **Add Processing Status Tracking**
```csharp
public class MatchProcessingStatus
{
    public Guid Id { get; set; }
    public Guid MatchId { get; set; }
    public DateTime ProcessedAt { get; set; }
    public int PredictionsProcessed { get; set; }
}
```

### Frontend Tasks

1. **Update Prediction Display**
- Show points earned badge (if scored)
- Display "Pending" or points value
- Color-code by points (green for 5, blue for 3, etc.)

2. **Add Processing Status Indicator**
- Show "Processing..." on recently finished matches
- Update to points when complete

3. **Update User Profile**
- Display total points earned
- Show accuracy percentage
- List points by competition

### Testing

- ✅ Points calculate correctly for all scenarios
- ✅ Exact score = 5 points
- ✅ Correct winner = 3 points
- ✅ Correct goal diff = 2 points
- ✅ Wrong prediction = 0 points
- ✅ Statistics update correctly
- ✅ Accuracy calculates properly
- ✅ Multiple competitions tracked separately

### Acceptance Criteria

- Finished matches auto-process within 5 minutes
- All predictions receive correct points
- User statistics update automatically
- Leaderboards show current points
- No duplicate processing occurs

---

## Phase 15: Competition-Specific Features 🟡 HIGH

### Priority: 🟡 P1 (Core UX)
**Estimated Time**: 13 hours (5h backend, 6h frontend, 2h testing)

### Backend Tasks

1. **Create UserCompetitionPreferences Entity**
```csharp
public class UserCompetitionPreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CompetitionCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

2. **Add Preference Endpoints**
```
GET    /api/v1/users/me/preferences
PUT    /api/v1/users/me/preferences
POST   /api/v1/users/me/preferences/competitions/{code}
DELETE /api/v1/users/me/preferences/competitions/{code}
```

3. **Update Leaderboard Endpoints**
```
GET /api/v1/leaderboard/{competitionCode}
GET /api/v1/leaderboard/{competitionCode}/user/{userId}
```

4. **Update Match Queries**
- Filter by user's preferred competitions
- Option to show all or only followed

### Frontend Tasks

1. **Create CompetitionPreferencesComponent**
- Grid of 12 competition checkboxes
- Save button
- "Select All" / "Deselect All"
- Visual feedback on save

2. **Update LeaderboardComponent**
- Add competition selector at top
- Filter by selected competition
- Show separate rankings per competition

3. **Create UserStatsCardComponent**
```html
<div class="stats-card">
  <div class="rank-badge">#{{ rank }}</div>
  <div class="stat-grid">
    <div class="stat">
      <span class="value">{{ totalPoints }}</span>
      <span class="label">Points</span>
    </div>
    <div class="stat">
      <span class="value">{{ totalPredictions }}</span>
      <span class="label">Predictions</span>
    </div>
    <div class="stat">
      <span class="value">{{ accuracy }}%</span>
      <span class="label">Accuracy</span>
    </div>
  </div>
</div>
```

4. **Update Home Feed**
- Filter matches by user preferences
- Option to toggle "Show all competitions"

### Acceptance Criteria

- Users can select preferred competitions
- Home feed shows only selected competitions
- Each competition has separate leaderboard
- User stats card displays correctly
- Rankings calculated per competition

---

## Phase 16: Match Organization & Filtering 🟡 HIGH

### Priority: 🟡 P1 (Essential for Usability)
**Estimated Time**: 10 hours (2h backend, 6h frontend, 2h testing)

### Frontend Tasks

1. **Create MatchStatusTabsComponent**
```html
<nav class="tabs">
  <button
    [class.active]="currentTab === 'upcoming'"
    (click)="selectTab('upcoming')">
    Upcoming
    <span class="badge">{{ upcomingCount }}</span>
  </button>
  <button
    [class.active]="currentTab === 'live'"
    (click)="selectTab('live')">
    Live
    <span class="badge live">{{ liveCount }}</span>
  </button>
  <button
    [class.active]="currentTab === 'completed'"
    (click)="selectTab('completed')">
    Completed
    <span class="badge">{{ completedCount }}</span>
  </button>
</nav>
```

2. **Create MatchdayFilterComponent**
```html
<select [(ngModel)]="selectedMatchday">
  <option value="">All Matchdays</option>
  <option *ngFor="let md of matchdays" [value]="md">
    Matchday {{ md }}
  </option>
</select>
```

3. **Update PredictionsListComponent**
- Add tabs at top
- Add matchday filter
- Group matches by matchday
- Show count badges

4. **Implement Tab Logic**
```typescript
get upcomingMatches() {
  return this.matches().filter(m => m.status === 'SCHEDULED');
}

get liveMatches() {
  return this.matches().filter(m => m.status === 'LIVE');
}

get completedMatches() {
  return this.matches().filter(m => m.status === 'FINISHED');
}

get matchdays() {
  return [...new Set(this.matches().map(m => m.matchday))].sort();
}
```

### Backend Tasks

1. **Optimize Queries**
- Add index on (CompetitionCode, Status, Matchday)
- Add index on (CompetitionCode, MatchDate)

2. **Update Match Endpoints**
```
GET /api/v1/matches?status=SCHEDULED&matchday=25
GET /api/v1/matches?status=LIVE
GET /api/v1/matches?status=FINISHED&matchday=25
```

### Acceptance Criteria

- 3 tabs working correctly
- Badge counts accurate
- Matchday filter functional
- Matches grouped logically
- Performance optimized

---

## Phase 17: Real-time Updates & Enhancements 🔵 MEDIUM

### Priority: 🔵 P2 (Nice to Have)
**Estimated Time**: 11 hours (4h backend, 5h frontend, 2h testing)

### Backend Tasks

1. **Add SignalR Hub**
```csharp
public class PredictionHub : Hub
{
    public async Task NotifyLeaderboardUpdate(string competitionCode)
    {
        await Clients.All.SendAsync(
            "LeaderboardUpdated",
            competitionCode
        );
    }

    public async Task NotifyMatchUpdate(Guid matchId)
    {
        await Clients.All.SendAsync(
            "MatchUpdated",
            matchId
        );
    }
}
```

2. **Integrate Hub Calls**
- Call from MatchResultProcessor
- Call from MatchSyncJob (for live score updates)

### Frontend Tasks

1. **Add SignalR Client**
```typescript
@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection: signalR.HubConnection;

  connect() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/predictionhub')
      .withAutomaticReconnect()
      .build();

    this.connection.on('LeaderboardUpdated', (code) => {
      this.leaderboardService.refresh(code);
    });

    this.connection.on('MatchUpdated', (matchId) => {
      this.matchService.refreshMatch(matchId);
    });
  }
}
```

2. **Add Countdown Timer**
```typescript
export class CountdownTimerComponent {
  timeRemaining = computed(() => {
    const match = this.match();
    if (!match) return '';

    const now = new Date();
    const kickoff = new Date(match.matchDate);
    const diff = kickoff.getTime() - now.getTime();

    if (diff <= 0) return 'Match started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} minutes`;
  });
}
```

3. **Auto-refresh Live Matches**
- Poll every 30 seconds when tab is "Live"
- Update scores in real-time

### Acceptance Criteria

- Leaderboard updates automatically
- Live scores refresh every 30 seconds
- Countdown timers accurate
- SignalR reconnects on disconnect

---

## Phase 18: Offline Support & PWA Enhancements 🔵 MEDIUM

### Priority: 🔵 P2 (PWA Optimization)
**Estimated Time**: 13 hours (2h backend, 8h frontend, 3h testing)

### Frontend Tasks

1. **IndexedDB Service**
```typescript
@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private db: IDBDatabase;

  async cacheMatches(matches: Match[]) {
    const tx = this.db.transaction(['matches'], 'readwrite');
    const store = tx.objectStore('matches');
    for (const match of matches) {
      await store.put(match);
    }
  }

  async getMatches(): Promise<Match[]> {
    const tx = this.db.transaction(['matches'], 'readonly');
    const store = tx.objectStore('matches');
    return store.getAll();
  }
}
```

2. **Offline Prediction Queue**
```typescript
async submitPrediction(prediction: Prediction) {
  if (navigator.onLine) {
    return this.http.post('/api/predictions', prediction);
  } else {
    await this.indexedDB.queuePrediction(prediction);
    return of({ queued: true });
  }
}
```

3. **Background Sync**
```typescript
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-predictions');
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-predictions') {
    event.waitUntil(syncPredictions());
  }
});
```

4. **Update Service Worker**
- Cache match data
- Cache API responses (1 hour)
- Queue offline predictions
- Sync on reconnect

### Acceptance Criteria

- App works offline
- Predictions queue when offline
- Auto-sync on reconnect
- Match data cached locally
- PWA installable

---

## Migration Strategy

### Database Migrations

**Migration 1**: Add Competition Support
```sql
CREATE TABLE Competitions (...);
CREATE TABLE UserCompetitionPreferences (...);
CREATE TABLE UserCompetitionStats (...);
CREATE TABLE MatchProcessingStatus (...);

ALTER TABLE Matches ADD CompetitionCode VARCHAR(10);
ALTER TABLE Matches ADD Venue NVARCHAR(200);
ALTER TABLE Matches ADD Matchday INT;

ALTER TABLE Predictions ADD CompetitionCode VARCHAR(10);
ALTER TABLE Predictions ADD PointsEarned INT;
ALTER TABLE Predictions ADD Status VARCHAR(20);
```

**Migration 2**: Add Indexes
```sql
CREATE INDEX IDX_Matches_Competition_Status ON Matches(CompetitionCode, Status);
CREATE INDEX IDX_Matches_Competition_Matchday ON Matches(CompetitionCode, Matchday);
CREATE INDEX IDX_Predictions_Status ON Predictions(Status);
CREATE INDEX IDX_UserStats_Competition_Points ON UserCompetitionStats(CompetitionCode, TotalPoints DESC);
```

### Deployment Order

1. Deploy Phase 13 backend (API integration)
2. Run Migration 1
3. Seed competitions
4. Deploy Phase 13 frontend
5. Test API sync
6. Deploy Phase 14 backend (result processing)
7. Deploy Phase 14 frontend
8. Test end-to-end flow
9. Continue with Phases 15-18

---

## Testing Strategy

### Unit Tests
- PointsCalculator (all scenarios)
- AccuracyCalculator
- Match status mapping
- Preference validation

### Integration Tests
- football-data.org API calls
- Background job execution
- Database transactions
- SignalR messages

### E2E Tests
- Complete prediction flow
- Result processing
- Leaderboard updates
- Offline mode

---

## Success Metrics

### Phase 13 Success:
- [ ] 1000+ matches synced
- [ ] All 12 competitions active
- [ ] Sync completes in < 5 minutes
- [ ] 0 API errors

### Phase 14 Success:
- [ ] 100% of predictions scored
- [ ] Processing completes in < 2 minutes per match
- [ ] Leaderboards 100% accurate
- [ ] 0 duplicate points

### Phase 15 Success:
- [ ] Users can filter to 1-12 competitions
- [ ] Leaderboards separate per competition
- [ ] Stats tracked accurately

### Phase 16 Success:
- [ ] Tabs load in < 500ms
- [ ] Filters apply instantly
- [ ] 100% accurate counts

### Phase 17 Success:
- [ ] SignalR latency < 500ms
- [ ] Live scores update within 1 minute
- [ ] 99.9% uptime

### Phase 18 Success:
- [ ] Offline mode works 100%
- [ ] Sync success rate > 99%
- [ ] PWA lighthouse score > 90

---

**Ready to Begin Phase 13 Implementation**
