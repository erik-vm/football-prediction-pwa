# Phase 2: Authentication & Authorization

**Estimated Time**: 4 hours
**Complexity**: Medium-High
**Prerequisites**: Phase 1 complete (Database with User entity)

---

## 🎯 OBJECTIVE

Implement complete JWT-based authentication system with refresh token rotation, BCrypt password hashing, and role-based authorization. By the end of this phase, users can register, login, and receive JWT tokens for API authentication.

---

## 📋 DELIVERABLES

- [ ] JWT token generation service configured
- [ ] BCrypt password hashing service (work factor 12)
- [ ] User registration endpoint (`/api/v1/auth/register`)
- [ ] User login endpoint (`/api/v1/auth/login`)
- [ ] Refresh token endpoint (`/api/v1/auth/refresh`)
- [ ] AuthService orchestration layer
- [ ] FluentValidation for registration/login DTOs
- [ ] User entity updated with RefreshToken columns
- [ ] Database migration applied (AddRefreshTokenToUser)
- [ ] Authorization policies configured (User/Admin roles)
- [ ] All changes committed to git
- [ ] Build with 0 warnings, 0 errors

---

## 🤖 AGENT DELEGATION

**Delegate to**: BACKEND-AGENT

**Instructions**:
```markdown
You are the BACKEND-AGENT. Your task is to implement JWT authentication.

**Read**:
- error-prevention/PHASE-02-PREVENTION.md (critical PostgreSQL port conflict)
- TECH-STACK.md (package versions)
- GAME-RULES.md (user roles: User, Admin)

**Implement**:
- JWT token generation with 60-minute expiration
- Refresh token rotation with 7-day expiration
- BCrypt password hashing (work factor 12)
- Registration and login endpoints
- Role-based authorization

**Critical - Avoid**:
- ❌ PostgreSQL port 5432 conflict (use port 5433!)
- ❌ Package version mismatches
- ❌ Storing plain text passwords
- ❌ Weak token expiration times

**Report back** when complete with:
- Registration test successful (HTTP 200 with tokens)
- Login test successful (JWT with correct claims)
- Build status (0 warnings, 0 errors)
```

---

## 📝 DETAILED IMPLEMENTATION STEPS

### Step 1: Add NuGet Packages (10 minutes)

```bash
cd backend/src/FootballPrediction.Api

# JWT authentication
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.0

# BCrypt password hashing
dotnet add package BCrypt.Net-Next --version 4.0.3

# FluentValidation
dotnet add package FluentValidation.AspNetCore --version 11.3.0

cd ../../
dotnet restore
dotnet build
# Should succeed
```

**Validation**: Packages installed, solution builds

---

### Step 2: Update User Entity with Refresh Token (5 minutes)

Modify `backend/src/FootballPrediction.Domain/Entities/User.cs`:

```csharp
namespace FootballPrediction.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }               // ADD THIS
    public DateTime? RefreshTokenExpiry { get; set; }        // ADD THIS
    public bool IsAdmin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
```

**Validation**: User entity updated

---

### Step 3: Create JWT Configuration (10 minutes)

Add to `backend/src/FootballPrediction.Api/appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=football_prediction;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-minimum-32-characters-for-HS256-algorithm",
    "Issuer": "FootballPredictionApi",
    "Audience": "FootballPredictionApp",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

**Important**: Generate a secure random key for production:
```bash
# PowerShell
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

**Validation**: JWT configuration added

---

### Step 4: Create DTOs (15 minutes)

Create `backend/src/FootballPrediction.Application/DTOs/Auth/`:

**RegisterRequest.cs**:
```csharp
namespace FootballPrediction.Application.DTOs.Auth;

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

**LoginRequest.cs**:
```csharp
namespace FootballPrediction.Application.DTOs.Auth;

public class LoginRequest
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

**TokenResponse.cs**:
```csharp
namespace FootballPrediction.Application.DTOs.Auth;

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
}
```

**RefreshTokenRequest.cs**:
```csharp
namespace FootballPrediction.Application.DTOs.Auth;

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
```

**Validation**: DTOs created

---

### Step 5: Create FluentValidation Validators (15 minutes)

Create `backend/src/FootballPrediction.Application/Validators/Auth/`:

**RegisterRequestValidator.cs**:
```csharp
using FluentValidation;
using FootballPrediction.Application.DTOs.Auth;

namespace FootballPrediction.Application.Validators.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(50)
            .Matches("^[a-zA-Z0-9_-]+$")
            .WithMessage("Username can only contain letters, numbers, underscores, and hyphens");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(100)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches("[0-9]").WithMessage("Password must contain at least one number");
    }
}
```

**LoginRequestValidator.cs**:
```csharp
using FluentValidation;
using FootballPrediction.Application.DTOs.Auth;

namespace FootballPrediction.Application.Validators.Auth;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.UsernameOrEmail)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MaximumLength(100);
    }
}
```

**Validation**: Validators created

---

### Step 6: Create Token Service (20 minutes)

Create `backend/src/FootballPrediction.Application/Services/Auth/ITokenService.cs`:

```csharp
using System.Security.Claims;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Application.Services.Auth;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
}
```

Create `backend/src/FootballPrediction.Infrastructure/Services/Auth/TokenService.cs`:

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using FootballPrediction.Application.Services.Auth;
using FootballPrediction.Domain.Entities;

namespace FootballPrediction.Infrastructure.Services.Auth;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly SymmetricSecurityKey _key;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        var secretKey = _configuration["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey not configured");
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
    }

    public string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expirationMinutes = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60");
        var credentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _key,
            ValidateIssuer = true,
            ValidIssuer = _configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = _configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }
}
```

**Validation**: Token service created

---

### Step 7: Create Password Service (10 minutes)

Create `backend/src/FootballPrediction.Application/Services/Auth/IPasswordService.cs`:

```csharp
namespace FootballPrediction.Application.Services.Auth;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
```

Create `backend/src/FootballPrediction.Infrastructure/Services/Auth/PasswordService.cs`:

```csharp
using FootballPrediction.Application.Services.Auth;

namespace FootballPrediction.Infrastructure.Services.Auth;

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
```

**Validation**: Password service created

---

### Step 8: Create Auth Service (25 minutes)

Create `backend/src/FootballPrediction.Application/Services/Auth/IAuthService.cs`:

```csharp
using FootballPrediction.Application.DTOs.Auth;

namespace FootballPrediction.Application.Services.Auth;

public interface IAuthService
{
    Task<TokenResponse> RegisterAsync(RegisterRequest request);
    Task<TokenResponse> LoginAsync(LoginRequest request);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken);
}
```

Create `backend/src/FootballPrediction.Infrastructure/Services/Auth/AuthService.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using FootballPrediction.Application.DTOs.Auth;
using FootballPrediction.Application.Services.Auth;
using FootballPrediction.Domain.Entities;
using FootballPrediction.Infrastructure.Data;

namespace FootballPrediction.Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public AuthService(
        ApplicationDbContext context,
        ITokenService tokenService,
        IPasswordService passwordService,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    public async Task<TokenResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if username exists
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException("Username already exists");
        }

        // Check if email exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(request.Password),
            IsAdmin = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(
            int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7"));

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = refreshTokenExpiry;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60"))
        };
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request)
    {
        // Find user by username or email
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Username == request.UsernameOrEmail ||
                u.Email == request.UsernameOrEmail);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Verify password
        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Generate new tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(
            int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7"));

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = refreshTokenExpiry;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60"))
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null || user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        // Generate new tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(
            int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7"));

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = refreshTokenExpiry;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60"))
        };
    }
}
```

**Validation**: Auth service created

---

### Step 9: Create Auth Controller (15 minutes)

Create `backend/src/FootballPrediction.Api/Controllers/AuthController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using FootballPrediction.Application.DTOs.Auth;
using FootballPrediction.Application.Services.Auth;

namespace FootballPrediction.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
```

**Validation**: Auth controller created

---

### Step 10: Configure JWT Authentication (20 minutes)

Modify `backend/src/FootballPrediction.Api/Program.cs`:

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using FootballPrediction.Infrastructure.Data;
using FootballPrediction.Application.Services.Auth;
using FootballPrediction.Infrastructure.Services.Auth;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"];

// Handle Render PostgreSQL URL format
if (connectionString != null && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    var uri = new Uri(connectionString);
    var host = uri.Host;
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    var userInfo = uri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Authentication services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("User", policy => policy.RequireRole("User", "Admin"));
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();  // ADD THIS - must be before UseAuthorization
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
```

**Validation**: JWT authentication configured

---

### Step 11: Create and Apply Migration (15 minutes) - CRITICAL

**IMPORTANT**: Use SQL script method AND ensure port 5433:

```bash
cd backend/src/FootballPrediction.Infrastructure

# Create migration
dotnet ef migrations add AddRefreshTokenToUser --startup-project ../FootballPrediction.Api

# Generate SQL script
dotnet ef migrations script --output migration_auth.sql --startup-project ../FootballPrediction.Api

cd ../..

# CRITICAL: Verify Docker PostgreSQL is on port 5433
docker ps | findstr football_prediction_db
# Should show "5433->5432/tcp"

# If on wrong port, recreate container:
# docker-compose down
# (edit docker-compose.yml to use port 5433)
# docker-compose up -d

# Apply SQL to PostgreSQL on port 5433
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration_auth.sql

# Verify columns added
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\d "Users"'
# Should show RefreshToken and RefreshTokenExpiry columns
```

**Validation**: Migration applied, RefreshToken columns exist

---

### Step 12: Test Authentication (20 minutes)

```bash
cd backend/src/FootballPrediction.Api

# Run API
dotnet run

# In another terminal, test registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234"
  }'

# Expected response (HTTP 200):
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "refreshToken": "base64-encoded-string",
#   "expiresAt": "2026-03-05T15:30:00Z",
#   "tokenType": "Bearer"
# }

# Test login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "Test1234"
  }'

# Expected response (HTTP 200):
# Same structure as registration response

# Test refresh token
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_FROM_ABOVE"
  }'

# Expected response (HTTP 200):
# New access token and refresh token

# Stop API (Ctrl+C)
```

**Validation**: All endpoints return HTTP 200 with tokens

---

### Step 13: Build and Validate (10 minutes)

```bash
cd backend

# Clean build
dotnet clean
dotnet build
# Should succeed with 0 warnings, 0 errors

# Run tests (if any exist)
dotnet test

# Verify no broken references
dotnet list package
```

**Validation**: Build successful, no errors

---

### Step 14: Commit Changes (10 minutes)

```bash
cd ..

# Stage all changes
git add backend/

# Check status
git status

# Create commit
git commit -m "$(cat <<'EOF'
feat: Phase 2 - Authentication & Authorization complete

JWT-based authentication system implemented:

Services (3):
- TokenService: JWT generation and validation
- PasswordService: BCrypt hashing (work factor 12)
- AuthService: Registration, login, refresh token orchestration

DTOs (4):
- RegisterRequest, LoginRequest
- TokenResponse, RefreshTokenRequest

Endpoints (3):
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh

Security Features:
- Refresh token rotation (7-day expiration)
- Access token expiration (60 minutes)
- Role-based authorization (User/Admin policies)
- FluentValidation for input validation
- BCrypt password hashing

Database:
- User entity updated with RefreshToken columns
- Migration AddRefreshTokenToUser applied

Testing:
- Registration tested: HTTP 200 ✅
- Login tested: HTTP 200 ✅
- Refresh token tested: HTTP 200 ✅

Build Status: ✅ 0 warnings, 0 errors

Next: Phase 3 - Core Scoring Logic
EOF
)"

# Update PROGRESS.md
# (Mark Phase 2 as complete)

git add PROGRESS.md
git commit -m "docs: Mark Phase 2 complete"
```

**Validation**: All changes committed

---

## ✅ VALIDATION CHECKLIST

**Quick Validation**:
- [ ] RefreshToken and RefreshTokenExpiry columns exist in Users table
- [ ] JWT configuration in appsettings.Development.json
- [ ] Registration endpoint: `curl -X POST http://localhost:5000/api/v1/auth/register` returns HTTP 200
- [ ] Login endpoint: `curl -X POST http://localhost:5000/api/v1/auth/login` returns HTTP 200
- [ ] Access token contains correct claims (sub, email, unique_name, role)
- [ ] Refresh token rotation working
- [ ] FluentValidation active (invalid email returns HTTP 400)
- [ ] PostgreSQL on port 5433 (not 5432)
- [ ] Build succeeds with 0 warnings, 0 errors
- [ ] All changes committed to git

**If all checked**: ✅ Phase 2 Complete

---

## 🛡️ ERROR PREVENTION

### Critical Error: PostgreSQL Port Conflict

**Symptom**: "column RefreshToken of relation Users does not exist"

**Root Cause**: Two PostgreSQL instances on port 5432 (Docker + Windows service)

**Solution**:
```bash
# Check for port conflict
netstat -ano | findstr :5432

# If conflict detected, use port 5433 for Docker
# docker-compose.yml:
ports:
  - "5433:5432"

# appsettings.Development.json:
"DefaultConnection": "Host=localhost;Port=5433;..."
```

**Prevention**:
- Always use port 5433 for Docker PostgreSQL
- Stop Windows PostgreSQL service if present
- Verify connection with `docker exec` before migrations

### Error 2: Package Version Compatibility

**Symptom**: Package X not compatible with net9.0

**Solution**:
```bash
# Use .NET 9 compatible versions
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.0
dotnet add package BCrypt.Net-Next --version 4.0.3
dotnet add package FluentValidation.AspNetCore --version 11.3.0
```

### Error 3: JWT SecretKey Too Short

**Symptom**: "IDX10720: Unable to create KeyedHashAlgorithm..."

**Solution**: Use minimum 32-character secret key (256 bits for HS256)

---

## 📊 COMPLETION CRITERIA

Phase 2 is **COMPLETE** when:

✅ All deliverables created
✅ All validation checks pass
✅ Registration/login endpoints tested successfully
✅ JWT tokens contain correct claims
✅ Refresh token rotation working
✅ Build succeeds (0 warnings, 0 errors)
✅ Migration applied (RefreshToken columns exist)
✅ All changes committed
✅ PROGRESS.md updated

---

## ⏭️ NEXT PHASE

**Phase 3: Core Scoring Logic**
- Implement ScoringService with 5-rule algorithm
- Write 29 comprehensive unit tests
- Validate against Java reference implementation

**Preparation**:
- [ ] Read `phases/PHASE-03-SCORING-LOGIC.md`
- [ ] Read `error-prevention/PHASE-03-PREVENTION.md`
- [ ] Read `GAME-RULES.md` Section 3 (scoring rules)

---

## 🕐 TIME TRACKING

**Estimated**: 4 hours
**Typical Actual**: 4 hours
**Potential Delays**:
- PostgreSQL port conflict: +3 hours (prevented by using 5433 from start)
- JWT configuration errors: +30 min
- Package version issues: +15 min

**With error prevention**: 2-3 hours

---

**Phase**: 2
**Version**: 2.0
**Last Updated**: 2026-03-05
**Status**: Production Ready
**Reference**: `.analysis/2026-02-08-phase-2-authentication-authorization-analysis.md`
