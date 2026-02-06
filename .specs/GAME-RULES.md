# Football Prediction Game - Official Rules and Scoring System

## Overview

This document defines the **official rules** for the Football Prediction Game. These rules are sourced from the working Spring Boot + React implementation and represent the **correct** scoring system.

**IMPORTANT**: The Flutter mobile app has incorrect scoring rules. Use ONLY the rules specified in this document.

---

## 1. Prediction Rules

### 1.1 Submission Requirements
- Users must predict the **exact score** for both teams (Home and Away)
- Valid scores: **0-9** (integers only)
- Predictions must be submitted **before match kickoff time**
- Users **cannot modify** predictions after kickoff

### 1.2 Prediction Format
```
Home Team Score: 0-9
Away Team Score: 0-9

Example: Manchester United 2 - 1 Barcelona
```

### 1.3 Deadline Enforcement
- System locks predictions at match kickoff time
- Late predictions are **not accepted**
- Users can update predictions any time before deadline

---

## 2. Scoring System (Base Points)

### 2.1 Point Calculation Rules

The scoring system awards points based on prediction accuracy:

| Scenario | Points | Description | Example |
|----------|--------|-------------|---------|
| **Exact Score Match** | **5** | Predicted score exactly matches actual score | Predicted 2:1, Actual 2:1 ✓ |
| **Correct Winner + Goal Difference** | **4** | Correct winner AND correct goal difference (but not exact score) | Predicted 1:0, Actual 2:1 ✓ (both +1) |
| **Correct Winner Only** | **3** | Predicted the winner correctly (or draw) | Predicted 2:0, Actual 3:1 ✓ |
| **One Team Score Correct** | **1** | Either home OR away score is correct | Predicted 0:1, Actual 0:2 ✓ |
| **No Match** | **0** | None of the above conditions met | Predicted 1:0, Actual 0:1 ✗ |

### 2.2 Detailed Scoring Logic

#### Rule 1: Exact Score (5 points)
```
IF predicted_home == actual_home AND predicted_away == actual_away
THEN award 5 points
```

**Examples:**
- Predicted 2:1, Actual 2:1 → **5 points** ✓
- Predicted 0:0, Actual 0:0 → **5 points** ✓
- Predicted 3:2, Actual 3:2 → **5 points** ✓

---

#### Rule 2: Correct Winner AND Correct Goal Difference (4 points)
```
IF same_winner AND abs(predicted_diff) == abs(actual_diff)
THEN award 4 points
```

**Goal Difference Calculation:**
```
predicted_diff = predicted_home - predicted_away
actual_diff = actual_home - actual_away
```

**Winner Determination Logic:**
```java
private boolean hasSameWinner(int predictedDiff, int actualDiff) {
    // Both are draws
    if (predictedDiff == 0 && actualDiff == 0) {
        return true;
    }
    // Both have same winner (home or away)
    return (predictedDiff > 0 && actualDiff > 0) ||
           (predictedDiff < 0 && actualDiff < 0);
}
```

**Examples:**
- Predicted 1:0 (diff: +1), Actual 2:1 (diff: +1) → **4 points** ✓
- Predicted 0:1 (diff: -1), Actual 1:2 (diff: -1) → **4 points** ✓
- Predicted 3:0 (diff: +3), Actual 4:1 (diff: +3) → **4 points** ✓
- Predicted 2:2 (diff: 0), Actual 1:1 (diff: 0) → **4 points** ✓ (both draws)

---

#### Rule 3: Correct Winner Only (3 points)
```
IF same_winner
THEN award 3 points
```

**Examples:**
- Predicted 2:0 (home wins), Actual 3:1 (home wins) → **3 points** ✓
- Predicted 1:3 (away wins), Actual 0:2 (away wins) → **3 points** ✓
- Predicted 1:1 (draw), Actual 2:2 (draw) → **3 points** ✓

---

#### Rule 4: One Team Score Correct (1 point)
```
IF predicted_home == actual_home OR predicted_away == actual_away
THEN award 1 point
```

**Examples:**
- Predicted 0:1, Actual 0:2 → **1 point** ✓ (home score correct)
- Predicted 2:1, Actual 3:1 → **1 point** ✓ (away score correct)
- Predicted 1:0, Actual 1:3 → **1 point** ✓ (home score correct)

---

#### Rule 5: No Match (0 points)
```
IF none of the above rules apply
THEN award 0 points
```

**Examples:**
- Predicted 1:0, Actual 0:1 → **0 points** ✗
- Predicted 3:2, Actual 0:0 → **0 points** ✗

---

## 3. Stage Multipliers

Points are multiplied based on the tournament stage to increase importance of later rounds.

### 3.1 Tournament Stages

| Stage | Multiplier | Base Points × Multiplier |
|-------|------------|-------------------------|
| **Group Stage** | **×1** | 0-5 points |
| **Round of 16** | **×2** | 0-10 points |
| **Quarter-Finals** | **×3** | 0-15 points |
| **Semi-Finals** | **×4** | 0-20 points |
| **Final** | **×5** | 0-25 points |

### 3.2 Total Points Calculation

```
total_points = base_points × stage_multiplier
```

### 3.3 Examples

**Group Stage (×1):**
- Exact score: 5 × 1 = **5 points**
- Correct winner + diff: 4 × 1 = **4 points**
- Correct winner: 3 × 1 = **3 points**

**Round of 16 (×2):**
- Exact score: 5 × 2 = **10 points**
- Correct winner + diff: 4 × 2 = **8 points**
- Correct winner: 3 × 2 = **6 points**

**Final (×5):**
- Exact score: 5 × 5 = **25 points**
- Correct winner + diff: 4 × 5 = **20 points**
- Correct winner: 3 × 5 = **15 points**

---

## 4. Weekly Bonus System

### 4.1 Bonus Points

Top performers each week receive bonus points added to their overall score:

| Rank | Bonus Points | Description |
|------|-------------|-------------|
| **1st Place** | **+5 points** | Highest weekly score |
| **2nd Place** | **+3 points** | Second highest weekly score |
| **3rd Place** | **+1 point** | Third highest weekly score |

### 4.2 Tie-Breaking Rules

When multiple users have the same weekly score:

```
bonus_per_user = total_bonus_points / number_of_tied_users
```

**Example 1: Two users tied for 1st**
- Total bonus: 5 points
- Each user gets: 5 ÷ 2 = **2.5 points**

**Example 2: Three users tied for 2nd**
- Total bonus: 3 points
- Each user gets: 3 ÷ 3 = **1 point**

### 4.3 Weekly Period Definition

- A "week" corresponds to a **Game Week** in the tournament
- Admin defines game week start and end dates
- All matches within that date range count toward weekly totals

---

## 5. Leaderboard Calculation

### 5.1 Overall Leaderboard

```
user_total_points = SUM(all_prediction_points) + SUM(weekly_bonus_points)
```

**Ranking:**
- Users ranked by total points (descending)
- Ties broken by: most exact scores → most correct winners → username alphabetically

### 5.2 Weekly Leaderboard

```
user_weekly_points = SUM(prediction_points_for_week)
```

**Note:** Weekly leaderboard shows points BEFORE weekly bonuses are applied

---

## 6. Season Predictions (Optional Feature)

### 6.1 Pre-Tournament Predictions

Before tournament starts, users can predict:

| Prediction Type | Points if Correct | Deadline |
|----------------|------------------|----------|
| **Tournament Winner** | **50 points** | Before first match |
| **Runner-Up** | **35 points** | Before first match |
| **Top Scorer** | **25 points** | Before first match |

### 6.2 Rules
- All season predictions must be made before tournament begins
- Predictions are locked after first match kickoff
- Points awarded at tournament conclusion
- Season prediction points added to overall total

---

## 7. Match Result Entry (Admin)

### 7.1 Admin Workflow

1. Admin enters final score for finished match:
   - Home team score (0-9+)
   - Away team score (0-9+)
2. System automatically:
   - Marks match as finished
   - Calculates points for all predictions
   - Applies stage multiplier
   - Updates leaderboard
   - Awards weekly bonuses (if week complete)

### 7.2 Point Recalculation

If admin corrects a match result:
- All affected predictions are **recalculated**
- User points are **updated**
- Leaderboard is **refreshed**
- Weekly bonuses are **recalculated** if needed

---

## 8. Scoring Implementation (Reference Code)

### 8.1 Java Implementation (Spring Boot)

```java
public int calculatePoints(Integer predictedHome, Integer predictedAway,
                            Integer actualHome, Integer actualAway) {
    if (predictedHome == null || predictedAway == null ||
        actualHome == null || actualAway == null) {
        return 0;
    }

    // Exact score match: 5 points
    if (predictedHome.equals(actualHome) && predictedAway.equals(actualAway)) {
        return 5;
    }

    int predictedDiff = predictedHome - predictedAway;
    int actualDiff = actualHome - actualAway;

    // Correct winner AND correct goal difference: 4 points
    if (hasSameWinner(predictedDiff, actualDiff) &&
        Math.abs(predictedDiff) == Math.abs(actualDiff)) {
        return 4;
    }

    // Correct winner only: 3 points
    if (hasSameWinner(predictedDiff, actualDiff)) {
        return 3;
    }

    // One team's score correct: 1 point
    if (predictedHome.equals(actualHome) || predictedAway.equals(actualAway)) {
        return 1;
    }

    return 0;
}

private boolean hasSameWinner(int predictedDiff, int actualDiff) {
    // Both are draws
    if (predictedDiff == 0 && actualDiff == 0) {
        return true;
    }
    // Both have same winner (home or away)
    return (predictedDiff > 0 && actualDiff > 0) ||
           (predictedDiff < 0 && actualDiff < 0);
}
```

### 8.2 .NET/C# Implementation Template

```csharp
public int CalculatePoints(int? predictedHome, int? predictedAway,
                           int? actualHome, int? actualAway)
{
    if (!predictedHome.HasValue || !predictedAway.HasValue ||
        !actualHome.HasValue || !actualAway.HasValue)
    {
        return 0;
    }

    // Exact score match: 5 points
    if (predictedHome == actualHome && predictedAway == actualAway)
    {
        return 5;
    }

    var predictedDiff = predictedHome.Value - predictedAway.Value;
    var actualDiff = actualHome.Value - actualAway.Value;

    // Correct winner AND correct goal difference: 4 points
    if (HasSameWinner(predictedDiff, actualDiff) &&
        Math.Abs(predictedDiff) == Math.Abs(actualDiff))
    {
        return 4;
    }

    // Correct winner only: 3 points
    if (HasSameWinner(predictedDiff, actualDiff))
    {
        return 3;
    }

    // One team's score correct: 1 point
    if (predictedHome == actualHome || predictedAway == actualAway)
    {
        return 1;
    }

    return 0;
}

private bool HasSameWinner(int predictedDiff, int actualDiff)
{
    // Both are draws
    if (predictedDiff == 0 && actualDiff == 0)
    {
        return true;
    }
    // Both have same winner (home or away)
    return (predictedDiff > 0 && actualDiff > 0) ||
           (predictedDiff < 0 && actualDiff < 0);
}
```

---

## 9. Edge Cases and Special Scenarios

### 9.1 No Prediction Submitted
- **Result**: 0 points for that match
- User can still participate in future matches

### 9.2 Match Postponed/Cancelled
- Admin can delete or reschedule match
- Existing predictions are preserved if rescheduled
- Points not calculated until match finishes

### 9.3 Extra Time / Penalties
- **Rule**: Use only the score at end of regular time (90 minutes)
- Extra time and penalty scores are **NOT used** for predictions
- Special tournaments may override this rule (document clearly)

### 9.4 Match Abandoned
- Admin decides on action:
  - Option 1: Delete match (predictions discarded)
  - Option 2: Enter score at abandonment time
  - Option 3: Reschedule and preserve predictions

---

## 10. Summary of Key Rules

### Core Scoring (Base Points)
1. **5 points** - Exact score
2. **4 points** - Correct winner + goal difference
3. **3 points** - Correct winner only
4. **1 point** - One team score correct
5. **0 points** - No match

### Multipliers
- Group: ×1
- R16: ×2
- QF: ×3
- SF: ×4
- Final: ×5

### Weekly Bonuses
- 1st: +5 points
- 2nd: +3 points
- 3rd: +1 point
- Ties split equally

### Season Predictions (Optional)
- Winner: 50 points
- Runner-up: 35 points
- Top scorer: 25 points

---

## 11. Testing Scenarios

### Test Case 1: Exact Score
```
Predicted: 2-1
Actual: 2-1
Expected: 5 points (×1 = 5 total in group stage)
```

### Test Case 2: Winner + Difference
```
Predicted: 1-0
Actual: 2-1
Expected: 4 points (×1 = 4 total in group stage)
```

### Test Case 3: Winner Only
```
Predicted: 3-0
Actual: 2-1
Expected: 3 points (×1 = 3 total in group stage)
```

### Test Case 4: One Score Correct
```
Predicted: 0-1
Actual: 0-2
Expected: 1 point (×1 = 1 total in group stage)
```

### Test Case 5: Draw Prediction
```
Predicted: 1-1
Actual: 2-2
Expected: 3 points (both draws, correct winner)
```

### Test Case 6: Stage Multiplier (Final)
```
Predicted: 2-1
Actual: 2-1
Expected: 5 × 5 = 25 points
```

---

**Version**: 1.0
**Source**: Spring Boot + React Implementation (C:\Projects\football-prediciton-game)
**Status**: Official Rules (Correct)
**Last Updated**: 2025-01-27
