# TICKET-006: JWT Authentication Service

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-005
**User Story**: US-001, US-002, US-003
**Complexity**: L
**Critical path**: YES

## Description
Implement AuthService (Register, Login, RefreshToken), JwtTokenService (HS256, 60min access, 7day refresh), BCrypt hashing (cost 12), AuthController, JWT middleware, and FluentValidation for request DTOs.

## Acceptance Criteria
- [ ] AuthService: Register (creates user with BCrypt hash, returns tokens)
- [ ] AuthService: Login (validates credentials, returns tokens)
- [ ] AuthService: RefreshToken (validates refresh token, returns new access token)
- [ ] JwtTokenService: GenerateAccessToken (HS256, 60min, claims: Sub, Email, Username, IsAdmin, Jti)
- [ ] JwtTokenService: GenerateRefreshToken (64 bytes, cryptographically random)
- [ ] BCrypt hashing with cost factor 12
- [ ] AuthController: POST /api/v1/auth/register, /login, /refresh
- [ ] JWT middleware configured in Program.cs (ValidateIssuer, ValidateAudience, ValidateLifetime, zero ClockSkew)
- [ ] RegisterRequest validation: username 3-50 chars, valid email, password 8+ with letter and digit
- [ ] LoginRequest validation: email required, password required
- [ ] Duplicate email/username returns 400
- [ ] Invalid credentials return 401
- [ ] JWT secret from environment variable (never hardcoded)
- [ ] Password never returned in any API response

## Test Plan
- [ ] Unit: Register creates user with hashed password
- [ ] Unit: Register rejects duplicate email
- [ ] Unit: Register rejects weak password
- [ ] Unit: Login with valid credentials returns tokens
- [ ] Unit: Login with invalid password returns null
- [ ] Unit: Refresh with valid token returns new access token
- [ ] Unit: Refresh with expired token returns null
- [ ] Unit: Validator rejects short username, invalid email, weak password

## Technical Notes
- Security Engineer review MANDATORY
- Check ERROR-PREVENTION.md: ERROR #1 (SDK version), ERROR #2 (dotnet-ef version)
- JWT secret must be minimum 32 characters
- DTOs in Application/DTOs/Auth/

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/DTOs/Auth/RegisterRequest.cs`
- [ ] `backend/src/FootballPrediction.Application/DTOs/Auth/LoginRequest.cs`
- [ ] `backend/src/FootballPrediction.Application/DTOs/Auth/RefreshTokenRequest.cs`
- [ ] `backend/src/FootballPrediction.Application/DTOs/Auth/AuthResponse.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IAuthService.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IJwtTokenService.cs`
- [ ] `backend/src/FootballPrediction.Application/Validators/RegisterRequestValidator.cs`
- [ ] `backend/src/FootballPrediction.Application/Validators/LoginRequestValidator.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/AuthService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/JwtTokenService.cs`
- [ ] `backend/src/FootballPrediction.Api/Controllers/AuthController.cs`
- [ ] `backend/src/FootballPrediction.Api/Program.cs` (JWT config)
