using FootballPrediction.Application.Services;
using FluentAssertions;
using Xunit;

namespace FootballPrediction.UnitTests.Services;

public class ScoringServiceTests
{
    private readonly ScoringService _scoringService;

    public ScoringServiceTests()
    {
        _scoringService = new ScoringService();
    }

    [Theory]
    [InlineData(2, 1, 2, 1, 5)]
    [InlineData(0, 0, 0, 0, 5)]
    [InlineData(3, 2, 3, 2, 5)]
    [InlineData(1, 1, 1, 1, 5)]
    [InlineData(5, 3, 5, 3, 5)]
    public void CalculatePoints_ExactScore_Returns5Points(
        int predHome, int predAway, int actHome, int actAway, int expected)
    {
        var result = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(1, 0, 2, 1, 4)]
    [InlineData(0, 1, 1, 2, 4)]
    [InlineData(3, 0, 4, 1, 4)]
    [InlineData(2, 2, 1, 1, 4)]
    [InlineData(0, 0, 1, 1, 4)]
    [InlineData(2, 1, 3, 2, 4)]
    [InlineData(1, 3, 0, 2, 4)]
    public void CalculatePoints_CorrectWinnerAndDifference_Returns4Points(
        int predHome, int predAway, int actHome, int actAway, int expected)
    {
        var result = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(2, 0, 4, 1, 3)]
    [InlineData(1, 3, 0, 4, 3)]
    [InlineData(3, 1, 5, 0, 3)]
    [InlineData(1, 0, 3, 0, 3)]
    [InlineData(0, 1, 2, 3, 3)]
    [InlineData(2, 2, 3, 3, 3)]
    public void CalculatePoints_CorrectWinnerOnly_Returns3Points(
        int predHome, int predAway, int actHome, int actAway, int expected)
    {
        var result = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(2, 0, 2, 3, 1)]
    [InlineData(1, 2, 3, 2, 1)]
    [InlineData(3, 1, 0, 1, 1)]
    [InlineData(0, 3, 2, 3, 1)]
    [InlineData(1, 0, 1, 2, 1)]
    public void CalculatePoints_OneScoreCorrect_Returns1Point(
        int predHome, int predAway, int actHome, int actAway, int expected)
    {
        var result = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(1, 0, 0, 1, 0)]
    [InlineData(3, 2, 0, 0, 0)]
    [InlineData(0, 2, 3, 0, 0)]
    [InlineData(2, 1, 1, 3, 0)]
    public void CalculatePoints_NoMatch_Returns0Points(
        int predHome, int predAway, int actHome, int actAway, int expected)
    {
        var result = _scoringService.CalculatePoints(predHome, predAway, actHome, actAway);
        result.Should().Be(expected);
    }

    [Fact]
    public void CalculatePoints_BothDraws_SameDifference_Returns4Points()
    {
        var result = _scoringService.CalculatePoints(2, 2, 1, 1);
        result.Should().Be(4);
    }

    [Fact]
    public void CalculatePoints_BothDraws_DifferentScores_Returns4Points()
    {
        var result = _scoringService.CalculatePoints(1, 1, 2, 2);
        result.Should().Be(4);
    }

    [Fact]
    public void CalculatePoints_HomeWins_BothDiffPlus1_Returns4Points()
    {
        var result = _scoringService.CalculatePoints(1, 0, 2, 1);
        result.Should().Be(4);
    }

    [Fact]
    public void CalculatePoints_AwayWins_BothDiffMinus2_Returns4Points()
    {
        var result = _scoringService.CalculatePoints(0, 2, 1, 3);
        result.Should().Be(4);
    }
}
