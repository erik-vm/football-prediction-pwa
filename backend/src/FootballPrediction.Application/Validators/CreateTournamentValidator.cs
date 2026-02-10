using FluentValidation;
using FootballPrediction.Application.DTOs.Tournament;

namespace FootballPrediction.Application.Validators;

public class CreateTournamentValidator : AbstractValidator<CreateTournamentDto>
{
    public CreateTournamentValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tournament name is required")
            .MaximumLength(100).WithMessage("Tournament name must not exceed 100 characters");

        RuleFor(x => x.Season)
            .NotEmpty().WithMessage("Season is required")
            .MaximumLength(20).WithMessage("Season must not exceed 20 characters");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date");
    }
}
