using FluentValidation;
using FootballPrediction.Application.DTOs.Prediction;

namespace FootballPrediction.Application.Validators;

public class UpdatePredictionValidator : AbstractValidator<UpdatePredictionDto>
{
    public UpdatePredictionValidator()
    {
        RuleFor(x => x.HomeScore)
            .GreaterThanOrEqualTo(0).WithMessage("Home score must be 0 or greater")
            .LessThanOrEqualTo(9).WithMessage("Home score must be 9 or less");

        RuleFor(x => x.AwayScore)
            .GreaterThanOrEqualTo(0).WithMessage("Away score must be 0 or greater")
            .LessThanOrEqualTo(9).WithMessage("Away score must be 9 or less");
    }
}
