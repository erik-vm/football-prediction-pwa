using FluentValidation;
using FootballPrediction.Application.DTOs.Prediction;
using FootballPrediction.Application.Interfaces;

namespace FootballPrediction.Application.Validators;

public class CreatePredictionValidator : AbstractValidator<CreatePredictionDto>
{
    private readonly IMatchRepository _matchRepository;

    public CreatePredictionValidator(IMatchRepository matchRepository)
    {
        _matchRepository = matchRepository;

        RuleFor(x => x.MatchId)
            .NotEmpty().WithMessage("Match ID is required")
            .MustAsync(MatchExists).WithMessage("Match does not exist");

        RuleFor(x => x.HomeScore)
            .GreaterThanOrEqualTo(0).WithMessage("Home score must be 0 or greater")
            .LessThanOrEqualTo(9).WithMessage("Home score must be 9 or less");

        RuleFor(x => x.AwayScore)
            .GreaterThanOrEqualTo(0).WithMessage("Away score must be 0 or greater")
            .LessThanOrEqualTo(9).WithMessage("Away score must be 9 or less");
    }

    private async Task<bool> MatchExists(Guid matchId, CancellationToken cancellationToken)
    {
        var match = await _matchRepository.GetByIdAsync(matchId);
        return match != null;
    }
}
