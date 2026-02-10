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

    #region Exact Score Match Tests (5 points)

    [Fact]
    public void CalculatePoints_ExactScore_Returns5Points()
    {
        // Arrange
        int predictedHome = 2, predictedAway = 1;
        int actualHome = 2, actualAway = 1;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(5, result);
    }

    [Fact]
    public void CalculatePoints_ExactScore_Draw_Returns5Points()
    {
        // Arrange
        int predictedHome = 0, predictedAway = 0;
        int actualHome = 0, actualAway = 0;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(5, result);
    }

    [Fact]
    public void CalculatePoints_ExactScore_HighScore_Returns5Points()
    {
        // Arrange
        int predictedHome = 3, predictedAway = 2;
        int actualHome = 3, actualAway = 2;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(5, result);
    }

    #endregion

    #region Correct Winner and Goal Difference Tests (4 points)

    [Fact]
    public void CalculatePoints_CorrectWinnerAndDifference_HomeWin_Returns4Points()
    {
        // Arrange
        int predictedHome = 1, predictedAway = 0;  // Home wins by 1
        int actualHome = 2, actualAway = 1;        // Home wins by 1

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(4, result);
    }

    [Fact]
    public void CalculatePoints_CorrectWinnerAndDifference_AwayWin_Returns4Points()
    {
        // Arrange
        int predictedHome = 0, predictedAway = 1;  // Away wins by 1
        int actualHome = 1, actualAway = 2;        // Away wins by 1

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(4, result);
    }

    [Fact]
    public void CalculatePoints_CorrectWinnerAndDifference_LargeDifference_Returns4Points()
    {
        // Arrange
        int predictedHome = 3, predictedAway = 0;  // Home wins by 3
        int actualHome = 4, actualAway = 1;        // Home wins by 3

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(4, result);
    }

    [Fact]
    public void CalculatePoints_CorrectWinnerAndDifference_BothDraws_Returns4Points()
    {
        // Arrange
        int predictedHome = 2, predictedAway = 2;  // Draw (diff 0)
        int actualHome = 1, actualAway = 1;        // Draw (diff 0)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(4, result);
    }

    #endregion

    #region Correct Winner Only Tests (3 points)

    [Fact]
    public void CalculatePoints_CorrectWinnerOnly_HomeWin_Returns3Points()
    {
        // Arrange
        int predictedHome = 3, predictedAway = 0;  // Home wins by 3
        int actualHome = 2, actualAway = 1;        // Home wins by 1 (different diff)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(3, result);
    }

    [Fact]
    public void CalculatePoints_CorrectWinnerOnly_AwayWin_Returns3Points()
    {
        // Arrange
        int predictedHome = 0, predictedAway = 3;  // Away wins by 3
        int actualHome = 1, actualAway = 2;        // Away wins by 1 (different diff)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(3, result);
    }

    [Fact]
    public void CalculatePoints_CorrectWinnerOnly_DifferentDifference_Returns3Points()
    {
        // Arrange
        // NOTE: "Correct winner only" cannot apply to draws because:
        // - Both draws always have diff=0, so abs(diff) always matches = 4 points
        // - Therefore, we test with home/away wins where diff is different
        int predictedHome = 2, predictedAway = 0;  // Home wins by 2
        int actualHome = 4, actualAway = 1;        // Home wins by 3 (different diff)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(3, result);
    }

    #endregion

    #region One Team Score Correct Tests (1 point)

    [Fact]
    public void CalculatePoints_HomeScoreCorrect_WrongWinner_Returns1Point()
    {
        // Arrange
        // For "one score correct" to return 1 point, we need a scenario where:
        // - One score matches BUT
        // - Winner is WRONG (so it doesn't return 3)
        int predictedHome = 2, predictedAway = 1;  // Home: 2, home wins by 1
        int actualHome = 2, actualAway = 3;        // Home: 2, AWAY wins by 1 (opposite winner!)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(1, result);
    }

    [Fact]
    public void CalculatePoints_AwayScoreCorrect_Returns1Point()
    {
        // Arrange
        int predictedHome = 0, predictedAway = 1;  // Away: 1, wins
        int actualHome = 2, actualAway = 1;        // Away: 1, loses (away score matches but different winner)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(1, result);
    }

    [Fact]
    public void CalculatePoints_HomeScoreCorrect_Alternative_Returns1Point()
    {
        // Arrange
        int predictedHome = 1, predictedAway = 2;  // Home: 1, loses
        int actualHome = 1, actualAway = 0;        // Home: 1, wins (home score matches but different winner)

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(1, result);
    }

    #endregion

    #region No Match Tests (0 points)

    [Fact]
    public void CalculatePoints_NoMatch_WrongWinner_Returns0Points()
    {
        // Arrange
        int predictedHome = 1, predictedAway = 0;  // Home wins
        int actualHome = 0, actualAway = 1;        // Away wins

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public void CalculatePoints_NoMatch_CompletelyWrong_Returns0Points()
    {
        // Arrange
        int predictedHome = 3, predictedAway = 2;
        int actualHome = 0, actualAway = 0;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    #endregion

    #region Null Value Tests

    [Fact]
    public void CalculatePoints_PredictedHomeNull_Returns0Points()
    {
        // Arrange
        int? predictedHome = null, predictedAway = 1;
        int actualHome = 2, actualAway = 1;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public void CalculatePoints_PredictedAwayNull_Returns0Points()
    {
        // Arrange
        int predictedHome = 2;
        int? predictedAway = null;
        int actualHome = 2, actualAway = 1;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public void CalculatePoints_ActualHomeNull_Returns0Points()
    {
        // Arrange
        int predictedHome = 2, predictedAway = 1;
        int? actualHome = null;
        int actualAway = 1;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public void CalculatePoints_ActualAwayNull_Returns0Points()
    {
        // Arrange
        int predictedHome = 2, predictedAway = 1;
        int actualHome = 2;
        int? actualAway = null;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public void CalculatePoints_AllNull_Returns0Points()
    {
        // Arrange
        int? predictedHome = null, predictedAway = null;
        int? actualHome = null, actualAway = null;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(0, result);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void CalculatePoints_ZeroZero_ExactMatch_Returns5Points()
    {
        // Arrange
        int predictedHome = 0, predictedAway = 0;
        int actualHome = 0, actualAway = 0;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(5, result);
    }

    [Fact]
    public void CalculatePoints_HighScoringGame_ExactMatch_Returns5Points()
    {
        // Arrange
        int predictedHome = 5, predictedAway = 4;
        int actualHome = 5, actualAway = 4;

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(5, result);
    }

    [Fact]
    public void CalculatePoints_LargeDifference_CorrectWinnerAndDiff_Returns4Points()
    {
        // Arrange
        int predictedHome = 5, predictedAway = 0;  // Home wins by 5
        int actualHome = 6, actualAway = 1;        // Home wins by 5

        // Act
        var result = _scoringService.CalculatePoints(predictedHome, predictedAway, actualHome, actualAway);

        // Assert
        Assert.Equal(4, result);
    }

    #endregion

    #region Test Cases from GAME-RULES.md Section 11

    [Fact]
    public void CalculatePoints_TestCase1_ExactScore_Returns5Points()
    {
        // Test Case 1 from GAME-RULES.md: Predicted 2-1, Actual 2-1
        var result = _scoringService.CalculatePoints(2, 1, 2, 1);
        Assert.Equal(5, result);
    }

    [Fact]
    public void CalculatePoints_TestCase2_WinnerAndDifference_Returns4Points()
    {
        // Test Case 2 from GAME-RULES.md: Predicted 1-0, Actual 2-1
        var result = _scoringService.CalculatePoints(1, 0, 2, 1);
        Assert.Equal(4, result);
    }

    [Fact]
    public void CalculatePoints_TestCase3_WinnerOnly_Returns3Points()
    {
        // Test Case 3 from GAME-RULES.md: Predicted 3-0, Actual 2-1
        var result = _scoringService.CalculatePoints(3, 0, 2, 1);
        Assert.Equal(3, result);
    }

    [Fact]
    public void CalculatePoints_TestCase4_CorrectWinner_Returns3Points()
    {
        // Test Case 4 from GAME-RULES.md: Predicted 0-1, Actual 0-2
        // NOTE: GAME-RULES.md examples say "1 point" but the reference Java implementation
        // returns 3 points because "correct winner" is checked BEFORE "one score correct"
        // pred 0:1 (away by 1), actual 0:2 (away by 2) = correct winner (both away wins) = 3 points
        // Home score IS correct (0==0) but that rule never gets checked due to precedence
        var result = _scoringService.CalculatePoints(0, 1, 0, 2);
        Assert.Equal(3, result); // Matches Java reference implementation
    }

    [Fact]
    public void CalculatePoints_TestCase5_DrawPrediction_CorrectWinnerAndDiff_Returns4Points()
    {
        // Test Case 5 from GAME-RULES.md: Predicted 1-1, Actual 2-2 (both draws)
        // NOTE: GAME-RULES.md says "3 points (both draws, correct winner)"
        // But both draws means diff=0 for both, so it's correct winner AND correct diff = 4 points
        // This matches the Java reference implementation
        var result = _scoringService.CalculatePoints(1, 1, 2, 2);
        Assert.Equal(4, result); // Matches Java reference implementation
    }

    #endregion
}
