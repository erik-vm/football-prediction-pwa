using FluentValidation;
using FootballPrediction.Application.DTOs.Match;

namespace FootballPrediction.Application.Validators;

public class UpdateMatchValidator : AbstractValidator<UpdateMatchDto>
{
    public UpdateMatchValidator()
    {
        RuleFor(x => x.HomeTeam)
            .NotEmpty().WithMessage("Home team is required")
            .MaximumLength(100).WithMessage("Home team name must not exceed 100 characters");

        RuleFor(x => x.AwayTeam)
            .NotEmpty().WithMessage("Away team is required")
            .MaximumLength(100).WithMessage("Away team name must not exceed 100 characters")
            .NotEqual(x => x.HomeTeam).WithMessage("Home team and away team must be different");

        RuleFor(x => x.KickoffTime)
            .NotEmpty().WithMessage("Kickoff time is required");

        RuleFor(x => x.Stage)
            .IsInEnum().WithMessage("Invalid tournament stage");
    }
}
