using FluentValidation;
using FootballPrediction.Application.DTOs.Match;

namespace FootballPrediction.Application.Validators;

public class EnterMatchResultValidator : AbstractValidator<EnterMatchResultDto>
{
    public EnterMatchResultValidator()
    {
        RuleFor(x => x.HomeScore)
            .GreaterThanOrEqualTo(0).WithMessage("Home score must be 0 or greater");

        RuleFor(x => x.AwayScore)
            .GreaterThanOrEqualTo(0).WithMessage("Away score must be 0 or greater");
    }
}
