using FluentValidation;
using FootballPrediction.Application.DTOs;

namespace FootballPrediction.Application.Validators;

public class PredictionRequestValidator : AbstractValidator<PredictionRequest>
{
    public PredictionRequestValidator()
    {
        RuleFor(x => x.MatchId).NotEmpty().WithMessage("MatchId is required");
        RuleFor(x => x.HomeScore).InclusiveBetween(0, 10).WithMessage("Home score must be between 0 and 10");
        RuleFor(x => x.AwayScore).InclusiveBetween(0, 10).WithMessage("Away score must be between 0 and 10");
    }
}
