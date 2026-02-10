using FluentValidation;
using FootballPrediction.Application.DTOs.GameWeek;

namespace FootballPrediction.Application.Validators;

public class UpdateGameWeekValidator : AbstractValidator<UpdateGameWeekDto>
{
    public UpdateGameWeekValidator()
    {
        RuleFor(x => x.WeekNumber)
            .GreaterThan(0).WithMessage("Week number must be greater than 0");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date");
    }
}
