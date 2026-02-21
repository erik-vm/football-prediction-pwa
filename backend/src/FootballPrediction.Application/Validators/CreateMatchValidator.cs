using FluentValidation;
using FootballPrediction.Application.DTOs.Match;
using FootballPrediction.Application.Interfaces;

namespace FootballPrediction.Application.Validators;

public class CreateMatchValidator : AbstractValidator<CreateMatchDto>
{
    private readonly IGameWeekRepository _gameWeekRepository;

    public CreateMatchValidator(IGameWeekRepository gameWeekRepository)
    {
        _gameWeekRepository = gameWeekRepository;

        RuleFor(x => x.GameWeekId)
            .MustAsync(GameWeekExists).WithMessage("Game week does not exist")
            .When(x => x.GameWeekId.HasValue);

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

    private async Task<bool> GameWeekExists(Guid? gameWeekId, CancellationToken cancellationToken)
    {
        if (!gameWeekId.HasValue)
            return true;

        return await _gameWeekRepository.ExistsAsync(gameWeekId.Value);
    }
}
