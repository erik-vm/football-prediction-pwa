# End-to-End Testing Guide
**Football Prediction PWA**
**Date:** February 21, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [User Journey Tests](#user-journey-tests)
4. [Admin Journey Tests](#admin-journey-tests)
5. [Cross-Browser Testing](#cross-browser-testing)
6. [Mobile Testing](#mobile-testing)
7. [Performance Testing](#performance-testing)
8. [Bug Reporting](#bug-reporting)

---

## Overview

This document provides step-by-step instructions for manually testing the Football Prediction PWA application end-to-end. All tests should be performed before each release to ensure quality.

### Testing Checklist

- [ ] User Registration Flow
- [ ] User Login Flow
- [ ] Prediction Submission
- [ ] Leaderboard Viewing
- [ ] Admin Tournament Creation
- [ ] Admin Match Management
- [ ] Admin Results Entry
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] PWA installation

---

## Test Environment Setup

### Prerequisites

1. **Backend API** running at `http://localhost:8080` or deployed URL
2. **Frontend** running at `http://localhost:4200` or deployed URL
3. **Database** populated with test data (optional)
4. **Admin Account** created (username: admin, password: Admin123!)

### Test Data Setup

Run these SQL commands to set up test data:

```sql
-- Create test tournament
INSERT INTO "Tournaments" ("Name", "StartDate", "EndDate", "IsActive", "CreatedAt", "UpdatedAt")
VALUES ('Test Tournament 2026', '2026-03-01', '2026-03-31', true, NOW(), NOW());

-- Get the tournament ID
SELECT "Id" FROM "Tournaments" WHERE "Name" = 'Test Tournament 2026';

-- Create test game week (replace {tournament_id} with actual ID)
INSERT INTO "GameWeeks" ("TournamentId", "WeekNumber", "StartDate", "EndDate", "CreatedAt", "UpdatedAt")
VALUES ({tournament_id}, 1, '2026-03-01', '2026-03-07', NOW(), NOW());

-- Get the game week ID
SELECT "Id" FROM "GameWeeks" WHERE "TournamentId" = {tournament_id} AND "WeekNumber" = 1;

-- Create test matches (replace {gameweek_id} with actual ID)
INSERT INTO "Matches" ("GameWeekId", "HomeTeam", "AwayTeam", "KickoffTime", "Stage", "CreatedAt", "UpdatedAt")
VALUES
  ({gameweek_id}, 'Team A', 'Team B', '2026-03-05 15:00:00', 0, NOW(), NOW()),
  ({gameweek_id}, 'Team C', 'Team D', '2026-03-06 18:00:00', 0, NOW(), NOW());
```

---

## User Journey Tests

### Test 1: New User Registration

**Objective:** Verify a new user can register successfully.

**Steps:**

1. Navigate to the application home page
2. Click "Register" or "Sign Up" link
3. Fill in the registration form:
   - Username: `testuser_[timestamp]` (e.g., `testuser_202602211030`)
   - Email: `testuser_[timestamp]@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
4. Click "Register" button

**Expected Results:**
- ✅ Registration succeeds with success message
- ✅ User is automatically logged in
- ✅ User is redirected to home page or dashboard
- ✅ Username is displayed in the header/navbar
- ✅ Backend creates user record in database

**Verification:**
```sql
SELECT * FROM "Users" WHERE "Username" = 'testuser_202602211030';
```

**Edge Cases to Test:**
- [ ] Register with existing username (should fail)
- [ ] Register with existing email (should fail)
- [ ] Password too short (should fail validation)
- [ ] Passwords don't match (should fail validation)
- [ ] Invalid email format (should fail validation)
- [ ] Username with special characters (should fail pattern validation)

---

### Test 2: User Login

**Objective:** Verify existing user can log in successfully.

**Steps:**

1. If logged in, log out first
2. Navigate to login page
3. Enter credentials:
   - Username or Email: `testuser_[timestamp]` OR `testuser_[timestamp]@example.com`
   - Password: `SecurePass123!`
4. Click "Login" button

**Expected Results:**
- ✅ Login succeeds
- ✅ JWT token stored in localStorage
- ✅ User redirected to home page
- ✅ Protected routes become accessible
- ✅ User info displayed in UI

**Verification:**
```javascript
// Open browser console
console.log(localStorage.getItem('access_token'));
console.log(localStorage.getItem('refresh_token'));
```

**Edge Cases to Test:**
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent username (should fail)
- [ ] Login with email instead of username (should work)
- [ ] Login with username instead of email (should work)

---

### Test 3: View Available Matches

**Objective:** Verify user can view upcoming matches.

**Prerequisites:** User is logged in, test matches exist

**Steps:**

1. Navigate to "Predictions" page
2. View list of upcoming matches

**Expected Results:**
- ✅ Upcoming matches are displayed
- ✅ Match details shown (teams, kickoff time, stage)
- ✅ Matches ordered by kickoff time
- ✅ No finished matches shown (if filtering applied)

---

### Test 4: Submit a Prediction

**Objective:** Verify user can submit a prediction for a match.

**Prerequisites:** User is logged in, upcoming match exists

**Steps:**

1. Navigate to "Predictions" page
2. Find an upcoming match without a prediction
3. Click "Predict" or enter scores:
   - Home Score: `2`
   - Away Score: `1`
4. Click "Submit Prediction"

**Expected Results:**
- ✅ Prediction saved successfully
- ✅ Success message displayed
- ✅ Prediction appears in user's predictions list
- ✅ Can't submit duplicate prediction for same match

**Verification:**
```sql
SELECT * FROM "Predictions"
WHERE "UserId" = (SELECT "Id" FROM "Users" WHERE "Username" = 'testuser_202602211030')
AND "MatchId" = {match_id};
```

**Edge Cases to Test:**
- [ ] Submit prediction for already started match (should fail)
- [ ] Submit prediction for finished match (should fail)
- [ ] Update existing prediction before match starts (should work)
- [ ] Negative scores (should fail validation)
- [ ] Non-numeric scores (should fail validation)

---

### Test 5: View Own Predictions

**Objective:** Verify user can view their submitted predictions.

**Steps:**

1. Navigate to "My Predictions" page
2. View list of predictions

**Expected Results:**
- ✅ All user predictions displayed
- ✅ Match details shown for each prediction
- ✅ Predicted scores visible
- ✅ Points earned shown (for finished matches)
- ✅ List ordered by match kickoff time

---

### Test 6: Update a Prediction

**Objective:** Verify user can update a prediction before match starts.

**Prerequisites:** User has existing prediction for upcoming match

**Steps:**

1. Navigate to "My Predictions"
2. Find prediction for upcoming match
3. Click "Edit" or update scores:
   - Home Score: `3` (changed)
   - Away Score: `2` (changed)
4. Click "Update Prediction"

**Expected Results:**
- ✅ Prediction updated successfully
- ✅ New scores saved to database
- ✅ UpdatedAt timestamp updated

**Edge Cases:**
- [ ] Update prediction after match started (should fail)
- [ ] Update prediction for finished match (should fail)

---

### Test 7: Delete a Prediction

**Objective:** Verify user can delete a prediction before match starts.

**Prerequisites:** User has existing prediction for upcoming match

**Steps:**

1. Navigate to "My Predictions"
2. Find prediction for upcoming match
3. Click "Delete" button
4. Confirm deletion (if prompted)

**Expected Results:**
- ✅ Prediction deleted successfully
- ✅ Prediction removed from database
- ✅ Prediction no longer appears in list

---

### Test 8: View Overall Leaderboard

**Objective:** Verify user can view the overall leaderboard.

**Prerequisites:** Multiple users with predictions and points

**Steps:**

1. Navigate to "Leaderboard" page
2. Click "Overall" tab (if tabs exist)

**Expected Results:**
- ✅ Leaderboard displays all users
- ✅ Users ordered by total points (descending)
- ✅ Columns shown: Rank, Username, Total Points, Exact Scores
- ✅ Current user highlighted (optional)

---

### Test 9: View Weekly Leaderboard

**Objective:** Verify user can view weekly leaderboard.

**Prerequisites:** Completed game week with results

**Steps:**

1. Navigate to "Leaderboard" page
2. Click "Weekly" tab
3. Select a game week from dropdown

**Expected Results:**
- ✅ Top 10 users for selected week displayed
- ✅ Users ordered by weekly points
- ✅ Weekly bonus points shown (if applicable)
- ✅ Can switch between different weeks

---

### Test 10: User Logout

**Objective:** Verify user can log out successfully.

**Steps:**

1. While logged in, click "Logout" button
2. Confirm logout (if prompted)

**Expected Results:**
- ✅ User logged out
- ✅ Tokens removed from localStorage
- ✅ Redirected to login page
- ✅ Protected routes no longer accessible
- ✅ Attempting to access protected route redirects to login

**Verification:**
```javascript
// Open browser console
console.log(localStorage.getItem('access_token')); // Should be null
```

---

## Admin Journey Tests

### Admin Login

**Credentials:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `Admin123!` (change in production!)

---

### Test 11: Create Tournament

**Objective:** Verify admin can create a new tournament.

**Prerequisites:** Logged in as admin

**Steps:**

1. Navigate to "Admin" dashboard
2. Click "Tournaments" section
3. Click "Create Tournament" button
4. Fill in form:
   - Name: `Euro 2026 Test`
   - Start Date: `2026-06-01`
   - End Date: `2026-07-01`
   - Is Active: `true`
5. Click "Create" button

**Expected Results:**
- ✅ Tournament created successfully
- ✅ Success message displayed
- ✅ Tournament appears in tournaments list
- ✅ Can be selected for game week creation

**Verification:**
```sql
SELECT * FROM "Tournaments" WHERE "Name" = 'Euro 2026 Test';
```

---

### Test 12: Create Game Week

**Objective:** Verify admin can create a game week.

**Prerequisites:** Tournament exists

**Steps:**

1. Navigate to "Admin" > "Game Weeks"
2. Click "Create Game Week"
3. Fill in form:
   - Tournament: `Euro 2026 Test`
   - Week Number: `1`
   - Start Date: `2026-06-01`
   - End Date: `2026-06-07`
4. Click "Create"

**Expected Results:**
- ✅ Game week created
- ✅ Appears in game weeks list
- ✅ Associated with correct tournament

**Verification:**
```sql
SELECT * FROM "GameWeeks"
WHERE "TournamentId" = (SELECT "Id" FROM "Tournaments" WHERE "Name" = 'Euro 2026 Test')
AND "WeekNumber" = 1;
```

---

### Test 13: Create Match

**Objective:** Verify admin can create a match.

**Prerequisites:** Game week exists

**Steps:**

1. Navigate to "Admin" > "Matches"
2. Click "Create Match"
3. Fill in form:
   - Game Week: Select created game week
   - Home Team: `France`
   - Away Team: `Germany`
   - Kickoff Time: `2026-06-05 20:00`
   - Stage: `Group` or `Knockout`
5. Click "Create"

**Expected Results:**
- ✅ Match created successfully
- ✅ Match appears in matches list
- ✅ Users can see match in predictions page

**Verification:**
```sql
SELECT * FROM "Matches" WHERE "HomeTeam" = 'France' AND "AwayTeam" = 'Germany';
```

---

### Test 14: Enter Match Results

**Objective:** Verify admin can enter results for finished matches.

**Prerequisites:** Match with kickoff time in the past, users have predictions

**Steps:**

1. Navigate to "Admin" > "Results"
2. Find finished match without results
3. Click "Enter Results"
4. Fill in form:
   - Home Score: `3`
   - Away Score: `1`
5. Click "Submit Results"

**Expected Results:**
- ✅ Results saved successfully
- ✅ Match marked as finished
- ✅ User predictions scored automatically
- ✅ Points added to user totals
- ✅ Leaderboard updated

**Verification:**
```sql
-- Check match has results
SELECT * FROM "Matches" WHERE "Id" = {match_id};

-- Check predictions scored
SELECT * FROM "Predictions" WHERE "MatchId" = {match_id};

-- Check user points updated
SELECT * FROM "Users" WHERE "Id" IN (
  SELECT "UserId" FROM "Predictions" WHERE "MatchId" = {match_id}
);
```

---

### Test 15: Calculate Weekly Bonuses

**Objective:** Verify admin can calculate weekly bonuses.

**Prerequisites:** Completed game week with all results entered

**Steps:**

1. Navigate to "Admin" > "Bonuses"
2. Select completed game week
3. Click "Calculate Bonuses"
4. Confirm action

**Expected Results:**
- ✅ Top 10 users identified
- ✅ Bonus points (50, 30, 20) awarded
- ✅ WeeklyBonus field updated in Users table
- ✅ Leaderboard reflects bonus points

**Verification:**
```sql
SELECT "Username", "WeeklyBonus" FROM "Users"
WHERE "WeeklyBonus" > 0
ORDER BY "WeeklyBonus" DESC;
```

---

### Test 16: View All Users (Admin)

**Objective:** Verify admin can view all registered users.

**Steps:**

1. Navigate to "Admin" > "Users"
2. View user list

**Expected Results:**
- ✅ All users displayed
- ✅ User details shown (username, email, role)
- ✅ Admin can see user statistics
- ✅ Can filter/search users (if implemented)

---

## Cross-Browser Testing

Test the application on the following browsers:

### Desktop Browsers

#### Chrome (Latest)
- [ ] User registration
- [ ] User login
- [ ] Prediction submission
- [ ] Leaderboard viewing
- [ ] Admin functions
- [ ] No console errors
- [ ] CSS renders correctly

#### Firefox (Latest)
- [ ] User registration
- [ ] User login
- [ ] Prediction submission
- [ ] Leaderboard viewing
- [ ] Admin functions
- [ ] No console errors
- [ ] CSS renders correctly

#### Edge (Latest)
- [ ] User registration
- [ ] User login
- [ ] Prediction submission
- [ ] Leaderboard viewing
- [ ] Admin functions
- [ ] No console errors
- [ ] CSS renders correctly

#### Safari (Latest - macOS only)
- [ ] User registration
- [ ] User login
- [ ] Prediction submission
- [ ] Leaderboard viewing
- [ ] No console errors
- [ ] CSS renders correctly

---

## Mobile Testing

### Mobile Browsers

#### Chrome Mobile (Android)

**Test Device:** Android phone or emulator

**Steps:**
1. Open Chrome on Android
2. Navigate to application URL
3. Test core features:
   - [ ] Login/Registration
   - [ ] Prediction submission
   - [ ] Leaderboard viewing
   - [ ] Responsive layout
   - [ ] Touch targets adequate size
   - [ ] No horizontal scrolling

#### Safari Mobile (iOS)

**Test Device:** iPhone or simulator

**Steps:**
1. Open Safari on iOS
2. Navigate to application URL
3. Test core features:
   - [ ] Login/Registration
   - [ ] Prediction submission
   - [ ] Leaderboard viewing
   - [ ] Responsive layout
   - [ ] Touch targets adequate size
   - [ ] No horizontal scrolling

### Responsive Design Testing

Test the following viewport sizes using browser DevTools:

#### Mobile Phone (Portrait)
- **Viewport:** 375x667 (iPhone SE)
- [ ] Navigation menu works (hamburger menu)
- [ ] Forms are usable
- [ ] Tables/lists scroll or adapt
- [ ] No content overflow

#### Mobile Phone (Landscape)
- **Viewport:** 667x375
- [ ] Layout adapts appropriately
- [ ] All content accessible

#### Tablet (Portrait)
- **Viewport:** 768x1024 (iPad)
- [ ] Layout uses available space well
- [ ] Navigation appropriate for tablet

#### Tablet (Landscape)
- **Viewport:** 1024x768
- [ ] Approaches desktop layout
- [ ] All features work correctly

---

## Performance Testing

### Page Load Performance

Use Chrome DevTools > Lighthouse to test:

**Metrics to Check:**
- [ ] Performance Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Speed Index < 3.0s
- [ ] Time to Interactive < 4.0s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1

**Run Lighthouse:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance", "Progressive Web App"
4. Click "Generate report"

### API Response Time Testing

Use browser Network tab:

**Expected Response Times:**
- GET /api/tournaments: < 200ms
- GET /api/matches: < 200ms
- POST /api/predictions: < 300ms
- GET /api/leaderboard/overall: < 500ms
- GET /api/leaderboard/weekly: < 500ms

**Test:**
1. Open DevTools > Network tab
2. Perform actions (login, view predictions, etc.)
3. Check response times in Network tab
4. Flag any requests > expected time

---

## PWA Testing

### PWA Installation

**Desktop (Chrome):**
1. Navigate to application
2. Look for install icon in address bar
3. Click install
4. Verify app installs and can be launched from desktop/taskbar

**Mobile (Chrome Android):**
1. Navigate to application
2. Tap menu (⋮)
3. Tap "Add to Home screen"
4. Verify app icon appears on home screen
5. Launch from home screen
6. Verify standalone mode (no browser chrome)

### Offline Functionality

**Test Service Worker:**
1. Load application while online
2. Open DevTools > Network tab
3. Set throttling to "Offline"
4. Reload page
5. Verify some content still loads (cached)
6. Try to submit prediction (should show offline message)

---

## Bug Reporting

### Bug Report Template

When you find a bug, create an issue with this information:

```markdown
### Bug Description
[Clear description of the bug]

### Steps to Reproduce
1. Step one
2. Step two
3. Step three

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080
- User Role: Regular User / Admin

### Screenshots
[Attach screenshots if applicable]

### Console Errors
[Copy any console errors]

### Additional Context
[Any other relevant information]

### Severity
- [ ] Critical (blocking functionality)
- [ ] High (major feature broken)
- [ ] Medium (feature partially working)
- [ ] Low (cosmetic issue)
```

---

## Testing Completion Checklist

Before marking testing as complete, ensure:

- [ ] All user journey tests passed
- [ ] All admin journey tests passed
- [ ] Tested on Chrome, Firefox, Edge
- [ ] Tested on mobile (iOS and Android)
- [ ] Responsive design works on all viewports
- [ ] PWA installs correctly
- [ ] Performance metrics acceptable
- [ ] No critical bugs found
- [ ] All found bugs documented
- [ ] Database integrity verified

---

**Document Version:** 1.0
**Last Updated:** February 21, 2026
**Next Review:** Before each release
