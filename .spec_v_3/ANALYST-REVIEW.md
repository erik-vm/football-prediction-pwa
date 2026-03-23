# Analyst Review - User Stories & Requirements Validation

**Date**: 2026-03-23
**Status**: Complete
**Reviewer**: Analyst Agent

---

## 1. Validated User Stories

### Epic: Authentication (US-001 to US-004)

**US-001: User Registration (P0)** -- PASS with notes
- AC are complete and testable.
- Gap: No AC for what characters are allowed in username (spaces? special chars?). Recommend: alphanumeric + underscores only.
- Gap: No rate limiting on registration endpoint. For MVP this is acceptable but should be noted.
- Gap: Password rule says "8+ chars, letter and digit" but the frontend view spec says "password (8+, letter+digit)" while the login form says "min 6". **Inconsistency**: Login form validation says min 6, registration says min 8. Recommendation: Align to 8 for both (registration creates the constraint; login just sends what user types).

**US-002: User Login (P0)** -- PASS
- AC are complete and testable.
- No edge case gaps.

**US-003: Token Refresh (P0)** -- PASS with notes
- AC are complete.
- Gap: No AC for what happens when refresh is called with a valid but already-rotated token (token reuse detection). For MVP, accept as known limitation.
- Gap: Frontend auto-refresh trigger not specified. Recommendation: Intercept 401 responses, attempt refresh, retry original request. If refresh fails, redirect to login.

**US-004: Logout (P0)** -- PASS
- AC are complete and testable.
- Edge case: What if logout is called when already logged out? Recommendation: Idempotent -- just clear storage and redirect regardless.

### Epic: Match Management (US-005 to US-009)

**US-005: View Upcoming Matches (P0)** -- PASS with notes
- AC are complete.
- Gap: PROJECT-SPEC defines a "Live" tab (IN_PLAY status) but this user story only covers "upcoming". There is no user story for viewing live matches. The Match List view spec says "Three tabs: Upcoming | Live | Completed" but only US-005 (upcoming) and US-006 (completed) exist. **Missing: US for Live matches tab.**
- Recommendation: Either add a user story for live matches or fold it into US-005/US-006 as a note.

**US-006: View Completed Matches (P0)** -- PASS
- AC are complete and testable.

**US-007: Filter Matches by Competition (P1)** -- PASS
- AC are complete.

**US-008: Filter Matches by Matchday (P1)** -- PASS
- AC are complete.
- Minor: "nearest matchday" logic needs clear definition. For upcoming: the matchday with the earliest future match. For completed: the matchday with the most recent finished match.

**US-009: Sync Match Data (P1)** -- PASS with notes
- AC say "Reloads page after completion." Recommendation: Reload data, not the full page (better UX).
- Gap: No AC for error handling during sync failure. Recommendation: Show toast/error message if sync fails.
- Gap: Should sync be restricted to admin users or available to all? The endpoint has no auth restriction listed in PROJECT-SPEC. Recommendation: Available to all authenticated users (the API is rate-limited at football-data.org level anyway).

### Epic: Predictions (US-010 to US-012)

**US-010: Submit Prediction (P0)** -- PASS with notes
- AC are complete and well-defined.
- Edge case: What happens if a match kickoff time is updated (moved earlier) after a user has seen the form but before they submit? The server must validate against the current kickoff time, not a cached one. This is already implied by "Cannot submit after match kickoff time" but worth being explicit.
- Gap: Score range validation (0-10) is only in the AC. The API spec (POST /predictions) doesn't mention validation constraints. Recommendation: Server must also validate 0-10 range.

**US-011: Edit Prediction (P1)** -- PASS
- AC are complete and testable.

**US-012: View My Predictions (P1)** -- PASS with notes
- AC say "Ordered by creation date descending." Consider ordering by match kickoff time descending instead -- more intuitive for users.
- Gap: No pagination specified. For MVP, acceptable if prediction counts are low. Note as future enhancement.

### Epic: Scoring & Leaderboard (US-013 to US-014)

**US-013: Automatic Scoring (P0)** -- PASS
- AC are thorough with multiple trigger paths.
- AC explicitly states "Already SCORED predictions are not re-processed" -- good idempotency.
- Gap: No AC for stage multiplier application. GAME-RULES.md defines multipliers (x1 to x5) but US-013 doesn't mention them. **Decision needed**: Are stage multipliers in scope for MVP? Recommendation: Defer to P2. The base scoring (5/4/3/1/0) is the MVP. Multipliers add complexity around detecting knockout stage from the API data.

**US-014: View Leaderboard (P0)** -- PASS with notes
- AC are complete.
- Gap: GAME-RULES.md defines weekly bonuses (+5/+3/+1 for top 3 each game week) but there is no user story covering weekly bonus calculation or display. **Decision needed**: Are weekly bonuses in scope? Recommendation: Defer to P2.
- Gap: Leaderboard accuracy formula uses `(totalPoints / (totalPredictions * 5)) * 100`. This only works correctly if stage multipliers are NOT applied. If multipliers are deferred, this formula is correct.
- Gap: The "Secondary tie-breaker: average points per prediction" from GAME-RULES.md is not in the leaderboard AC. The AC only says "Tie-breaking: points DESC, then predictions DESC." Recommendation: Add the third tie-breaker to match GAME-RULES.md.

### Epic: Tournaments (US-015)

**US-015: View Tournaments (P1)** -- PASS with notes
- AC are minimal but sufficient for MVP.
- Gap: No AC for what "links to view matches" means in terms of navigation. Recommendation: Button navigates to /matches with competition filter pre-set.

### Epic: User Preferences (US-016)

**US-016: Competition Preferences (P1)** -- PASS with notes
- AC are complete.
- Gap: What is the default state for new users? All competitions selected or none? Recommendation: All selected by default (better first-time experience).
- Gap: Preferences are localStorage only. If user logs in from another device, preferences are lost. For MVP this is acceptable. Note as future enhancement (server-side persistence).

### Epic: PWA & Offline (US-017 to US-018)

**US-017: PWA Installation (P2)** -- PASS
- AC are sufficient for P2 scope.

**US-018: Offline Prediction Queue (P2)** -- PASS with notes
- Edge case: What if a queued prediction's match has already kicked off by the time the user reconnects? The server will reject it. The UI should notify the user which predictions failed to sync and why.
- Gap: No AC for conflict resolution (user made prediction offline, but also made one online from another device). The unique constraint (UserId, MatchId) will cause 409. Recommendation: Show error to user, discard the offline copy.

### Epic: UI/UX (US-019 to US-021)

**US-019: Dark/Light Theme (P2)** -- PASS
- AC are sufficient.

**US-020: Mobile Navigation (P1)** -- PASS
- AC are complete.

**US-021: Points Info Tooltip (P2)** -- PASS
- AC are sufficient.

### Epic: Data Integration & Deployment (US-022 to US-024)

**US-022: Football Data Sync (P0)** -- PASS
- AC are thorough.
- Gap: No AC for handling API key exhaustion (free tier: 10 requests/minute). The 6.5s delay handles this, but no AC for what happens if the API returns 429. Recommendation: Retry with exponential backoff, log the failure.

**US-023: Backend Deployment (P0)** -- PASS
- AC are complete, informed by ERROR-PREVENTION.md lessons.

**US-024: Frontend Deployment (P0)** -- PASS
- AC are complete.

---

## 2. Edge Case Decisions

### Q1: What happens when a match is postponed after predictions are made?
**Recommendation: Keep predictions, do not score until match is played or cancelled.**
- Match status changes to POSTPONED.
- Predictions remain with status PENDING.
- The scoring logic only processes FINISHED matches, so POSTPONED matches are naturally skipped.
- If the match is rescheduled and eventually played, predictions are scored normally.
- If cancelled permanently, predictions stay PENDING indefinitely (no points awarded, no penalty).
- No code change needed -- the existing status-based scoring handles this correctly.

### Q2: What happens when a match score is corrected after scoring?
**Recommendation: Accept as known MVP limitation. Do not re-score.**
- Re-scoring would require: finding all SCORED predictions for that match, recalculating points, updating leaderboard.
- Risk: Users see points change retroactively, which is confusing.
- For MVP: If a score correction happens (rare), an admin would need to manually handle it.
- Future enhancement: Add a "re-score match" admin endpoint.

### Q3: Should users see other users' predictions before match starts?
**Recommendation: No. Predictions are private until the match kicks off.**
- The API already supports this: GET /predictions/my returns only the current user's predictions, and GET /predictions/match/{matchId} returns only the current user's prediction for that match.
- There is no endpoint that returns all users' predictions for a match.
- After the match finishes, the leaderboard shows aggregated points (not individual predictions).
- Future enhancement (P2): Show a "predictions reveal" after kickoff where users can see what others predicted.

### Q4: What is the minimum viable set of competitions to sync?
**Recommendation: Sync all 12 competitions. User preferences filter the display.**
- The football-data.org free tier supports all 12 listed competitions.
- Syncing all gives users maximum choice.
- With 6.5s between requests and 12 competitions, a full sync takes ~78 seconds minimum -- acceptable for a background job.
- User preferences (US-016) control what the user sees, not what gets synced.

---

## 3. Missing Requirements

### 3.1 Missing User Stories

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| **Live matches tab** -- PROJECT-SPEC defines 3 tabs (Upcoming, Live, Completed) but no user story covers the Live tab | Medium | Add to US-005 AC: "Live tab shows matches with status IN_PLAY, ordered by kickoff ascending" |
| **Stage multipliers** -- GAME-RULES.md defines them, no user story implements them | Low | Defer to P2. Document as out-of-scope for MVP. |
| **Weekly bonuses** -- GAME-RULES.md defines them, no user story implements them | Low | Defer to P2. Document as out-of-scope for MVP. |
| **Admin features** -- Manual result entry endpoint exists (POST /matches/{id}/result) but no admin UI story | Low | For MVP, admin uses the API directly. No UI needed. |
| **Delete prediction** -- API spec has DELETE /predictions/{id} but no user story covers it | Low | Add to US-011 or create US-011b. AC: "User can delete prediction before kickoff. Confirmation dialog required." |
| **Error/loading states** -- No user story covers error handling UX (network errors, API failures) | Medium | Add as cross-cutting AC: "All API calls show loading spinner. Errors display user-friendly toast messages." |

### 3.2 Spec Inconsistencies

| Item | Location 1 | Location 2 | Issue |
|------|-----------|-----------|-------|
| Password min length | US-001: "8+ characters" | Frontend Login view: "min 6" | Align to 8 |
| Leaderboard tie-breaker | GAME-RULES.md: 3 levels | US-014: 2 levels | Add third tie-breaker to US-014 |
| Prediction model | PROJECT-SPEC entity: has CompetitionCode | Frontend model: no CompetitionCode | Add CompetitionCode to frontend Prediction model |
| Tournament model | PROJECT-SPEC entity: has Code, Type, Country, LogoUrl | Frontend model: has description, isActive (not in entity) | Align models |

### 3.3 Missing Non-Functional Requirements

| Gap | Recommendation |
|-----|----------------|
| No logging/monitoring strategy | Add: "Structured logging to console. Errors logged with context." |
| No data retention policy | Add: "Predictions and match data retained indefinitely for MVP." |
| No API versioning strategy | Already using /api/v1/ prefix -- good. Document that breaking changes require /api/v2/. |

---

## 4. Priority Validation

### Current Priority Distribution
- **P0 (Critical)**: US-001, 002, 003, 004, 005, 006, 010, 013, 014, 022, 023, 024 (12 stories)
- **P1 (Important)**: US-007, 008, 009, 011, 012, 015, 016, 020 (8 stories)
- **P2 (Enhancement)**: US-017, 018, 019, 021 (4 stories)

### Priority Assessment

**All P0 assignments are correct.** These form the minimum viable product: auth, view matches, make predictions, auto-scoring, leaderboard, data sync, deployment.

**P1 adjustments recommended:**
- US-009 (Manual Sync): Consider promoting to **P0**. Without sync, there's no data. The auto-sync is P0 (part of US-022), but the manual sync button is critical for testing and for when users want fresh data. However, since US-022 covers auto-sync, US-009 as P1 is technically acceptable.
- US-012 (View My Predictions): This could be argued as P0 since users need feedback on their predictions. However, US-006 (completed matches) already shows "my prediction and points earned if exists," so users get this feedback. P1 is acceptable.

**No changes to priority assignments needed.** The current distribution is sound.

### Critical Path

The critical path for MVP delivery is:

```
US-023 (Backend Deploy) + US-024 (Frontend Deploy)  [infrastructure first]
    |
US-001 (Register) -> US-002 (Login) -> US-003 (Token Refresh)  [auth]
    |
US-022 (Data Sync)  [populate matches]
    |
US-005 (Upcoming Matches) + US-006 (Completed Matches)  [view data]
    |
US-010 (Submit Prediction)  [core gameplay]
    |
US-013 (Auto Scoring)  [core scoring]
    |
US-014 (Leaderboard)  [competition]
```

All P0 stories are on the critical path. No P1 story blocks a P0 story.

### Recommended Build Order

**Phase 1 - Foundation**: US-023, US-024, US-001, US-002, US-003, US-004
**Phase 2 - Core Data**: US-022, US-005, US-006
**Phase 3 - Core Gameplay**: US-010, US-013, US-014
**Phase 4 - Polish (P1)**: US-007, US-008, US-009, US-011, US-012, US-016, US-020, US-015
**Phase 5 - Enhancements (P2)**: US-017, US-018, US-019, US-021

---

## 5. Summary of Action Items

| # | Action | Priority |
|---|--------|----------|
| 1 | Fix password min length inconsistency (align to 8) | Must fix |
| 2 | Add Live matches tab to US-005 AC | Must fix |
| 3 | Add third tie-breaker to US-014 AC | Should fix |
| 4 | Add CompetitionCode to frontend Prediction model | Must fix |
| 5 | Align Tournament frontend model with backend entity | Should fix |
| 6 | Document stage multipliers and weekly bonuses as P2/out-of-scope | Should do |
| 7 | Add delete prediction user story or fold into US-011 | Nice to have |
| 8 | Define default state for new user preferences (all selected) | Should fix |
| 9 | Add error/loading state cross-cutting requirements | Should fix |
| 10 | Add score range validation (0-10) to API spec | Must fix |
