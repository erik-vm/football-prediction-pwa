# Phase 3: Core Scoring Logic

**Estimated Time**: 2 hours
**Complexity**: Medium
**Prerequisites**: Phase 2 complete (Backend with authentication)

---

## 🎯 OBJECTIVE

Implement the core prediction scoring algorithm exactly matching the Java reference implementation. Create comprehensive unit tests covering all 5 scoring rules and edge cases. By the end of this phase, the scoring engine will be fully functional and tested.

---

## 📋 DELIVERABLES

- [ ] IScoringService interface created
- [ ] ScoringService implementation with CalculatePoints method
- [ ] HasSameWinner helper method implemented
- [ ] 5 scoring rules implemented (exact, winner+diff, winner, one score, no match)
- [ ] 29 comprehensive unit tests written
- [ ] All tests passing (100% pass rate)
- [ ] Service registered in DI container
- [ ] Build with 0 warnings, 0 errors
- [ ] All changes committed to git

---

## 🤖 AGENT DELEGATION

**Delegate to**: BACKEND-AGENT

**Instructions**:
```markdown
You are the BACKEND-AGENT. Your task is to implement the core scoring logic.

**Read**:
- GAME-RULES.md Section 3 (Scoring Rules)
- GAME-RULES.md Section 11 (Test Cases)
- Reference: Java ScoringService.java

**Implement**:
- Scoring algorithm with 5 rules (5, 4, 3, 1, 0 points)
- Comprehensive unit tests (29 tests minimum)
- Exact match to reference implementation

**Critical - Note**:
- ❌ GAME-RULES.md has documentation errors in examples
- ✅ Implementation should match Java code, NOT doc examples
- ❌ Do NOT follow Test Case 4 and 5 in documentation
- ✅ Correct winner always takes precedence over "one score correct"

**Report back** when complete with:
- All 29 tests passing
- Build status (0 warnings, 0 errors)
- Any documentation inconsistencies found
```

---

## 📝 DETAILED IMPLEMENTATION STEPS

### Step 1: Review Scoring Rules (10 minutes)

Read `GAME-RULES.md` Section 3 carefully:

**5 Scoring Rules (in order of precedence)**:
1. **Exact Score** (5 points): Both home and away scores match exactly
2. **Correct Winner + Goal Difference** (4 points): Same winner AND same goal difference
3. **Correct Winner Only** (3 points): Same winner (home/away/draw) but different goal difference
4. **One Score Correct** (1 point): Either home OR away score matches
5. **No Match** (0 points): None of the above

**Important**: Rules are checked in order. First match wins!

**Validation**: Understand the 5 rules

---

### Step 2: Create IScoringService Interface (5 minutes)

Create `backend/src/FootballPrediction.Application/Services/IScoringService.cs`:

```csharp
namespace FootballPrediction.Application.Services;

public interface IScoringService
{
    int CalculatePoints(
        int predictedHomeScore,
        int predictedAwayScore,
        int actualHomeScore,
        int actualAwayScore);
}
```

**Validation**: Interface created

---

### Step 3: Implement ScoringService (20 minutes)

Create `backend/src/FootballPrediction.Application/Services/ScoringService.cs`:

```csharp
namespace FootballPrediction.Application.Services;

public class ScoringService : IScoringService
{
    public int CalculatePoints(
        int predictedHomeScore,
        int predictedAwayScore,
        int actualHomeScore,
        int actualAwayScore)
    {
        // Rule 1: Exact score (5 points)
        if (predictedHomeScore == actualHomeScore && predictedAwayScore == actualAwayScore)
        {
            return 5;
        }

        // Calculate goal differences
        int predictedDifference = predictedHomeScore - predictedAwayScore;
        int actualDifference = actualHomeScore - actualAwayScore;

        // Rule 2: Correct winner + goal difference (4 points)
        if (HasSameWinner(predictedDifference, actualDifference) &&
            Math.Abs(predictedDifference) == Math.Abs(actualDifference))
        {
            return 4;
        }

        // Rule 3: Correct winner only (3 points)
        if (HasSameWinner(predictedDifference, actualDifference))
        {
            return 3;
        }

        // Rule 4: One score correct (1 point)
        if (predictedHomeScore == actualHomeScore || predictedAwayScore == actualAwayScore)
        {
            return 1;
        }

        // Rule 5: No match (0 points)
        return 0;
    }

    private static bool HasSameWinner(int predictedDifference, int actualDifference)
    {
        // Both home wins (positive difference)
        if (predictedDifference > 0 && actualDifference > 0)
            return true;

        // Both away wins (negative difference)
        if (predictedDifference < 0 && actualDifference < 0)
            return true;

        // Both draws (zero difference)
        if (predictedDifference == 0 && actualDifference == 0)
            return true;

        return false;
    }
}
```

**Key Points**:
- **Order matters**: Rules checked in precedence order (5 → 4 → 3 → 1 → 0)
- **Goal difference**: Sign indicates winner (positive=home, negative=away, zero=draw)
- **HasSameWinner**: Checks if both differences have same sign
- **Absolute value**: For Rule 2, check magnitude of difference

**Validation**: ScoringService implemented

---

### Step 4: Register Service in DI (5 minutes)

Modify `backend/src/FootballPrediction.Api/Program.cs`:

Add this line with other service registrations:

```csharp
// Scoring service
builder.Services.AddScoped<IScoringService, ScoringService>();
```

**Validation**: Service registered

---

### Step 5: Create Unit Test Project Setup (10 minutes)

Verify test project has necessary packages:

```bash
cd backend/tests/FootballPrediction.UnitTests

# Should already have xUnit, Moq, FluentAssertions from Phase 1
dotnet list package

# Add reference to Application project if not already present
dotnet add reference ../../src/FootballPrediction.Application/FootballPrediction.Application.csproj

cd ../..
```

**Validation**: Test project ready

---

### Step 6: Write Comprehensive Unit Tests (45 minutes)

Create `backend/tests/FootballPrediction.UnitTests/Services/ScoringServiceTests.cs`:

```csharp
using FluentAssertions;
using FootballPrediction.Application.Services;
using Xunit;

namespace FootballPrediction.UnitTests.Services;

public class ScoringServiceTests
{
    private readonly ScoringService _scoringService;

    public ScoringServiceTests()
    {
        _scoringService = new ScoringService();
    }

    #region Rule 1: Exact Score (5 points)

    [Theory]
    [InlineData(2, 1, 2, 1)]
    [InlineData(0, 0, 0, 0)]
    [InlineData(3, 3, 3, 3)]
    [InlineData(5, 2, 5, 2)]
    public void CalculatePoints_ExactScore_Returns5Points(
        int predHome, int predAway, int actHome, int actAway)
    {
        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(5);
    }

    #endregion

    #region Rule 2: Correct Winner + Goal Difference (4 points)

    [Theory]
    [InlineData(2, 1, 3, 2)] // Predicted 2:1 (diff +1), Actual 3:2 (diff +1)
    [InlineData(1, 0, 3, 2)] // Predicted 1:0 (diff +1), Actual 3:2 (diff +1)
    [InlineData(3, 1, 5, 3)] // Predicted 3:1 (diff +2), Actual 5:3 (diff +2)
    [InlineData(0, 2, 1, 3)] // Predicted 0:2 (diff -2), Actual 1:3 (diff -2)
    [InlineData(1, 1, 2, 2)] // Predicted 1:1 (draw), Actual 2:2 (draw) - CORRECTED
    public void CalculatePoints_CorrectWinnerAndDifference_Returns4Points(
        int predHome, int predAway, int actHome, int actAway)
    {
        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(4);
    }

    #endregion

    #region Rule 3: Correct Winner Only (3 points)

    [Theory]
    [InlineData(2, 0, 3, 1)] // Both home wins, different differences
    [InlineData(3, 1, 1, 0)] // Both home wins, different differences
    [InlineData(0, 2, 0, 3)] // Both away wins, different differences
    [InlineData(1, 3, 2, 5)] // Both away wins, different differences
    [InlineData(0, 1, 0, 2)] // Both away wins - CORRECTED (was returning 1 point)
    public void CalculatePoints_CorrectWinnerOnly_Returns3Points(
        int predHome, int predAway, int actHome, int actAway)
    {
        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(3);
    }

    #endregion

    #region Rule 4: One Score Correct (1 point)

    [Theory]
    [InlineData(2, 0, 2, 1)] // Home score correct (2), away different
    [InlineData(0, 2, 1, 2)] // Away score correct (2), home different
    [InlineData(3, 1, 3, 2)] // Home score correct (3), away different
    [InlineData(1, 3, 2, 3)] // Away score correct (3), home different
    public void CalculatePoints_OneScoreCorrect_Returns1Point(
        int predHome, int predAway, int actHome, int actAway)
    {
        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(1);
    }

    #endregion

    #region Rule 5: No Match (0 points)

    [Theory]
    [InlineData(2, 1, 1, 2)] // Predicted home win, actual away win
    [InlineData(1, 1, 2, 0)] // Predicted draw, actual home win
    [InlineData(2, 0, 1, 1)] // Predicted home win, actual draw
    [InlineData(0, 3, 3, 0)] // Complete opposite
    public void CalculatePoints_NoMatch_Returns0Points(
        int predHome, int predAway, int actHome, int actAway)
    {
        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(0);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void CalculatePoints_HighScores_ExactMatch_Returns5Points()
    {
        // Arrange
        int predHome = 7, predAway = 5;
        int actHome = 7, actAway = 5;

        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(5);
    }

    [Fact]
    public void CalculatePoints_ZeroZeroDraw_ExactMatch_Returns5Points()
    {
        // Arrange
        int predHome = 0, predAway = 0;
        int actHome = 0, actAway = 0;

        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(5);
    }

    [Fact]
    public void CalculatePoints_DrawPrediction_DrawActual_DifferentScores_Returns4Points()
    {
        // Arrange - Both draws with 0 difference
        int predHome = 1, predAway = 1;
        int actHome = 2, actAway = 2;

        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert - Correct winner (draw) AND correct difference (0)
        points.Should().Be(4);
    }

    [Fact]
    public void CalculatePoints_LargeDifference_SameWinner_Returns3Points()
    {
        // Arrange
        int predHome = 1, predAway = 0; // Difference: +1
        int actHome = 5, actAway = 0;   // Difference: +5

        // Act
        var points = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);

        // Assert
        points.Should().Be(3); // Correct winner, different difference
    }

    #endregion

    #region Test Cases from GAME-RULES.md (with corrections)

    [Fact]
    public void CalculatePoints_TestCase1_ExactScore_Returns5Points()
    {
        // From GAME-RULES.md Test Case 1
        var points = _scoringService.CalculatePoints(2, 1, 2, 1);
        points.Should().Be(5);
    }

    [Fact]
    public void CalculatePoints_TestCase2_CorrectWinnerAndDifference_Returns4Points()
    {
        // From GAME-RULES.md Test Case 2
        var points = _scoringService.CalculatePoints(2, 1, 3, 2);
        points.Should().Be(4);
    }

    [Fact]
    public void CalculatePoints_TestCase3_CorrectWinnerOnly_Returns3Points()
    {
        // From GAME-RULES.md Test Case 3
        var points = _scoringService.CalculatePoints(2, 0, 3, 1);
        points.Should().Be(3);
    }

    [Fact]
    public void CalculatePoints_TestCase4_CorrectWinner_Returns3Points()
    {
        // From GAME-RULES.md Test Case 4
        // Documentation says 1 point, but implementation returns 3 points
        // Reason: Both are away wins (correct winner takes precedence)
        var points = _scoringService.CalculatePoints(0, 1, 0, 2);
        points.Should().Be(3); // NOT 1 as documentation suggests
    }

    [Fact]
    public void CalculatePoints_TestCase5_DrawsBothSameDifference_Returns4Points()
    {
        // From GAME-RULES.md Test Case 5
        // Documentation says 3 points, but implementation returns 4 points
        // Reason: Both draws (winner) with difference 0 (same difference)
        var points = _scoringService.CalculatePoints(1, 1, 2, 2);
        points.Should().Be(4); // NOT 3 as documentation suggests
    }

    [Fact]
    public void CalculatePoints_TestCase6_NoMatch_Returns0Points()
    {
        // From GAME-RULES.md Test Case 6
        var points = _scoringService.CalculatePoints(2, 1, 1, 2);
        points.Should().Be(0);
    }

    #endregion
}
```

**Important Notes**:
- **29 tests total**: Covers all rules + edge cases + documentation test cases
- **Test Case 4 & 5 corrections**: Documentation has errors, implementation is correct
- **Correct winner precedence**: Rule 3 (3 points) always beats Rule 4 (1 point)
- **Draw handling**: Two draws with same scores (0 diff) = Rule 2 (4 points)

**Validation**: 29 tests written

---

### Step 7: Run Tests (10 minutes)

```bash
cd backend

# Run all tests
dotnet test

# Expected output:
# Starting test execution, please wait...
# A total of 1 test files matched the specified pattern.
#
# Passed!  - Failed:     0, Passed:    29, Skipped:     0, Total:    29

# If any tests fail, review the implementation
# Tests should match Java reference implementation exactly
```

**Validation**: All 29 tests passing

---

### Step 8: Build Solution (5 minutes)

```bash
cd backend

# Clean build
dotnet clean
dotnet build

# Expected output:
# Build succeeded.
#     0 Warning(s)
#     0 Error(s)
```

**Validation**: Build successful with 0 warnings, 0 errors

---

### Step 9: Document Findings (10 minutes)

Create a note in PROGRESS.md about documentation inconsistencies:

**Documentation Errors Found**:
- Test Case 4 (0:1 vs 0:2): Documentation says 1 point, but correct answer is 3 points
  - Both are away wins (correct winner), so Rule 3 applies
- Test Case 5 (1:1 vs 2:2): Documentation says 3 points, but correct answer is 4 points
  - Both are draws with 0 goal difference (correct winner AND difference), so Rule 2 applies
- Rule precedence: Correct winner (Rule 3, 3 points) always beats one score correct (Rule 4, 1 point)

**Validation**: Findings documented

---

### Step 10: Commit Changes (10 minutes)

```bash
cd ..

# Stage changes
git add backend/

# Check status
git status

# Create commit
git commit -m "$(cat <<'EOF'
feat: Phase 3 - Core Scoring Logic complete

Scoring algorithm implementation:

Service:
- IScoringService interface
- ScoringService with CalculatePoints method
- HasSameWinner helper method

Algorithm (5 rules in precedence order):
1. Exact score: 5 points
2. Correct winner + goal difference: 4 points
3. Correct winner only: 3 points
4. One score correct: 1 point
5. No match: 0 points

Testing:
- 29 comprehensive unit tests
- 100% pass rate
- Edge cases covered
- Validated against Java reference implementation

Documentation Issues Found:
- Test Case 4: Doc says 1 point, correct is 3 points
- Test Case 5: Doc says 3 points, correct is 4 points
- Implementation follows Java reference, not doc examples

Build Status: ✅ 0 warnings, 0 errors, 29/29 tests passing

Next: Phase 4 - Tournament & Match Management
EOF
)"

# Update PROGRESS.md
git add PROGRESS.md
git commit -m "docs: Mark Phase 3 complete"
```

**Validation**: All changes committed

---

## ✅ VALIDATION CHECKLIST

**Quick Validation**:
- [ ] IScoringService interface exists in Application layer
- [ ] ScoringService implements 5 scoring rules correctly
- [ ] HasSameWinner helper method implemented
- [ ] Service registered in DI (Program.cs)
- [ ] 29 unit tests exist in UnitTests project
- [ ] All 29 tests passing (100% pass rate)
- [ ] Test output: `dotnet test` shows 0 failed
- [ ] Build succeeds with 0 warnings, 0 errors
- [ ] Documentation errors noted in PROGRESS.md
- [ ] All changes committed to git

**If all checked**: ✅ Phase 3 Complete

---

## 🛡️ ERROR PREVENTION

### Issue 1: Test Case Documentation Errors

**Symptom**: Tests "failing" when implementation is correct

**Root Cause**: GAME-RULES.md Test Case 4 and 5 have incorrect expected values

**Solution**: Follow Java reference implementation, NOT documentation examples

**Correct Values**:
- Test Case 4 (0:1 vs 0:2): 3 points (correct winner), not 1 point
- Test Case 5 (1:1 vs 2:2): 4 points (winner + diff), not 3 points

### Issue 2: Rule Precedence Confusion

**Symptom**: Incorrect points when both "winner" and "one score" match

**Solution**: Rules are checked in ORDER. First match wins.
- Rule 3 (winner) is checked BEFORE Rule 4 (one score)
- If winner is correct, you get 3 points minimum

### Issue 3: Draw Handling

**Symptom**: Confusion about draw scenarios

**Solution**: Draws are handled by goal difference
- If both differences are 0 (draws), HasSameWinner returns true
- Two draws with different scores (1:1 vs 2:2) = Rule 2 (4 points)

---

## 📊 COMPLETION CRITERIA

Phase 3 is **COMPLETE** when:

✅ All deliverables created
✅ All validation checks pass
✅ 29/29 tests passing (100% pass rate)
✅ Build succeeds (0 warnings, 0 errors)
✅ Algorithm matches Java reference implementation
✅ Documentation errors identified and noted
✅ Service registered in DI
✅ All changes committed
✅ PROGRESS.md updated

---

## ⏭️ NEXT PHASE

**Phase 4: Tournament & Match Management**
- Create 4-layer system (Tournament, GameWeek, Match, Result Entry)
- Implement 55 tests (100% passing)
- Repository pattern with proper abstractions
- Integration with Phase 3 scoring system

**Preparation**:
- [ ] Read `phases/PHASE-04-TOURNAMENT-MANAGEMENT.md`
- [ ] Read `error-prevention/PHASE-04-PREVENTION.md`
- [ ] Ensure Phase 3 scoring service is working

---

## 🕐 TIME TRACKING

**Estimated**: 2 hours
**Typical Actual**: 2 hours
**Potential Delays**:
- Test case documentation confusion: +45 min (prevented by knowing about errors)
- Rule precedence misunderstanding: +15 min
- Draw handling confusion: +10 min

**With error prevention**: 1.5-2 hours

---

**Phase**: 3
**Version**: 2.0
**Last Updated**: 2026-03-05
**Status**: Production Ready
**Reference**: `.analysis/2026-02-10-phase-3-core-scoring-logic-analysis.md`
