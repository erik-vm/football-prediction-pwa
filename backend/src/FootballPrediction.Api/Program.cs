using System.Text;
using FluentValidation;
using FootballPrediction.Application.Interfaces;
using FootballPrediction.Infrastructure.Jobs;
using FootballPrediction.Application.Services;
using FootballPrediction.Application.Validators;
using FootballPrediction.Infrastructure.Data;
using FootballPrediction.Infrastructure.Data.Seed;
using FootballPrediction.Api.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add SignalR
builder.Services.AddSignalR();

// Configure PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("FootballPrediction.Infrastructure"))
    .EnableSensitiveDataLogging()
    .EnableDetailedErrors());

// Register repositories
builder.Services.AddScoped<IUserRepository, FootballPrediction.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<ITournamentRepository, FootballPrediction.Infrastructure.Repositories.TournamentRepository>();
builder.Services.AddScoped<IGameWeekRepository, FootballPrediction.Infrastructure.Repositories.GameWeekRepository>();
builder.Services.AddScoped<IMatchRepository, FootballPrediction.Infrastructure.Repositories.MatchRepository>();
builder.Services.AddScoped<IPredictionRepository, FootballPrediction.Infrastructure.Repositories.PredictionRepository>();
builder.Services.AddScoped<IWeeklyBonusRepository, FootballPrediction.Infrastructure.Repositories.WeeklyBonusRepository>();
builder.Services.AddScoped<IUserCompetitionStatsRepository, FootballPrediction.Infrastructure.Repositories.UserCompetitionStatsRepository>();
builder.Services.AddScoped<IUserPreferenceRepository, FootballPrediction.Infrastructure.Repositories.UserPreferenceRepository>();

// Register application services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IScoringService, ScoringService>();
builder.Services.AddScoped<IMatchResultService, MatchResultService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddHttpClient<FootballDataService>();

// Register background services
builder.Services.AddHostedService<MatchSyncBackgroundJob>();
builder.Services.AddHostedService<ResultProcessingBackgroundJob>();

// Register validators
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// Configure JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("Jwt:SecretKey not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Jwt:Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("Jwt:Audience not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();
        await CompetitionSeeder.SeedCompetitionsAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<PredictionHub>("/predictionhub");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck");

app.Run();

public partial class Program { }
