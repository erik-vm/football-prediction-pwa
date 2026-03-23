using FluentAssertions;
using FootballPrediction.Infrastructure.Services;

namespace FootballPrediction.Tests.Services;

public class ScoringServiceTests
{
    private readonly ScoringService _sut = new();

    [Theory]
    [InlineData(2, 1, 2, 1, 5, "Exact match")]
    [InlineData(0, 0, 0, 0, 5, "Exact draw")]
    [InlineData(3, 1, 2, 0, 4, "Same winner (home), same diff (2)")]
    [InlineData(1, 1, 2, 2, 4, "Both draws, diff=0")]
    [InlineData(1, 1, 0, 0, 4, "Both draws")]
    [InlineData(2, 0, 1, 0, 3, "Same winner (home), diff differs")]
    [InlineData(0, 1, 0, 3, 3, "Same winner (away), diff differs")]
    [InlineData(2, 1, 3, 0, 3, "Same winner, diff differs")]
    [InlineData(2, 1, 2, 0, 3, "Same winner (home), home score also matches")]
    [InlineData(1, 3, 2, 3, 3, "Same winner (away), away score also matches")]
    [InlineData(1, 0, 1, 2, 1, "Home score correct, wrong winner (pred home win, actual away win)")]
    [InlineData(0, 2, 0, 0, 1, "Home score correct, wrong winner (pred away win, actual draw)")]
    [InlineData(2, 1, 0, 3, 0, "Wrong everything")]
    [InlineData(3, 0, 0, 1, 0, "Wrong winner, wrong scores")]
    public void CalculatePoints_ReturnsCorrectScore(
        int predHome, int predAway, int actHome, int actAway, int expected, string reason)
    {
        _sut.CalculatePoints(predHome, predAway, actHome, actAway)
            .Should().Be(expected, reason);
    }

    [Fact]
    public void CalculatePoints_DrawPrediction_DrawActual_DifferentScores_Returns4()
    {
        _sut.CalculatePoints(3, 3, 1, 1).Should().Be(4);
    }

    [Fact]
    public void CalculatePoints_HighScoreExactMatch_Returns5()
    {
        _sut.CalculatePoints(5, 4, 5, 4).Should().Be(5);
    }

    [Fact]
    public void CalculatePoints_OneScoreCorrect_WrongWinner_Returns1()
    {
        _sut.CalculatePoints(0, 2, 0, 0).Should().Be(1);
    }

    [Fact]
    public void CalculatePoints_ZeroZero_Vs_OneOne_Returns4()
    {
        _sut.CalculatePoints(0, 0, 1, 1).Should().Be(4);
    }
}
