# Game Rules - Football Prediction Scoring

**STATUS: FROZEN - DO NOT MODIFY**
This scoring algorithm has been validated with 32 unit tests across 2 development cycles.

## Base Points (checked in strict order - first match wins)

| Rule | Condition | Points |
|------|-----------|--------|
| 1 | **Exact score** - both home and away scores match | 5 |
| 2 | **Correct winner + same goal difference** | 4 |
| 3 | **Correct winner only** (home win, away win, or draw) | 3 |
| 4 | **One score correct** (either home OR away, but wrong winner) | 1 |
| 5 | **No match** - everything wrong | 0 |

## Critical Implementation Details

- Rules are checked in **STRICT ORDER**: Rule 1 first, then 2, then 3, then 4, then 5
- A draw always has goal difference = 0, so a matching draw = 4 points (Rule 2), never 3
- Rule 4 (one score correct) only triggers when the winner prediction is WRONG (otherwise Rule 3 catches it first)
- Winner is determined by: home > away = home win, away > home = away win, equal = draw

## Stage Multipliers (for tournament knockout stages)

| Stage | Multiplier |
|-------|-----------|
| Group Stage / League | x1 |
| Round of 16 | x2 |
| Quarter-Finals | x3 |
| Semi-Finals | x4 |
| Final | x5 |

## Weekly Bonuses (after all matches in a game week complete)

| Position | Bonus |
|----------|-------|
| 1st place | +5 points |
| 2nd place | +3 points |
| 3rd place | +1 point |
| Ties | Split equally |

## Leaderboard

- Ranked by total points (descending)
- Tie-breaker: total predictions count (descending)
- Secondary tie-breaker: average points per prediction (descending)
- Accuracy formula: `(totalPoints / (totalPredictions * 5)) * 100`

## Reference Implementation

```csharp
public int CalculatePoints(int predictedHome, int predictedAway, int actualHome, int actualAway)
{
    if (predictedHome == actualHome && predictedAway == actualAway)
        return 5;

    int predictedDiff = predictedHome - predictedAway;
    int actualDiff = actualHome - actualAway;
    bool sameWinner = Math.Sign(predictedDiff) == Math.Sign(actualDiff);

    if (sameWinner && predictedDiff == actualDiff)
        return 4;

    if (sameWinner)
        return 3;

    if (predictedHome == actualHome || predictedAway == actualAway)
        return 1;

    return 0;
}
```

## Test Cases (must all pass)

| Predicted | Actual | Points | Reason |
|-----------|--------|--------|--------|
| 2-1 | 2-1 | 5 | Exact match |
| 0-0 | 0-0 | 5 | Exact draw |
| 3-1 | 2-0 | 4 | Same winner (home), same diff (2) |
| 1-1 | 2-2 | 4 | Both draws, diff=0 |
| 2-0 | 1-0 | 3 | Same winner (home), diff differs |
| 0-1 | 0-3 | 3 | Same winner (away), diff differs |
| 1-1 | 0-0 | 4 | Both draws |
| 2-1 | 3-0 | 3 | Same winner, diff differs |
| 2-1 | 2-0 | 1 | Home score correct, wrong diff |
| 1-3 | 2-3 | 1 | Away score correct, wrong winner |
| 2-1 | 0-3 | 0 | Wrong everything |
| 3-0 | 0-1 | 0 | Wrong winner, wrong scores |
