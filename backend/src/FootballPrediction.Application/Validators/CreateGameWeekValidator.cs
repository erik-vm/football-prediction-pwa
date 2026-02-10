using FluentValidation;
using FootballPrediction.Application.DTOs.GameWeek;
using FootballPrediction.Application.Interfaces;

namespace FootballPrediction.Application.Validators;

public class CreateGameWeekValidator : AbstractValidator<CreateGameWeekDto>
{
    private readonly ITournamentRepository _tournamentRepository;

    public CreateGameWeekValidator(ITournamentRepository tournamentRepository)
    {
        _tournamentRepository = tournamentRepository;

        RuleFor(x => x.TournamentId)
            .NotEmpty().WithMessage("Tournament ID is required")
            .MustAsync(TournamentExists).WithMessage("Tournament does not exist");

        RuleFor(x => x.WeekNumber)
            .GreaterThan(0).WithMessage("Week number must be greater than 0");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date");
    }

    private async Task<bool> TournamentExists(Guid tournamentId, CancellationToken cancellationToken)
    {
        return await _tournamentRepository.ExistsAsync(tournamentId);
    }
}
