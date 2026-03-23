# TICKET-001: Solution & Project Setup (Clean Architecture)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: none
**User Story**: N/A (infrastructure)
**Complexity**: M
**Critical path**: YES

## Description
Create .NET 9 solution with 4 projects following Clean Architecture. Install all NuGet packages at locked versions from TECH-STACK.md. Configure global.json for .NET 9. Add Program.cs skeleton with JSON cycle handling (ERROR #15).

## Acceptance Criteria
- [ ] Solution file at backend/FootballPrediction.sln
- [ ] 4 projects: Domain, Application, Infrastructure, Api
- [ ] Dependency direction: Api → Infrastructure → Application → Domain
- [ ] global.json pins .NET SDK to 9.0.x
- [ ] All NuGet packages at exact versions from TECH-STACK.md
- [ ] Program.cs has ReferenceHandler.IgnoreCycles configured
- [ ] Solution builds with 0 errors, 0 warnings
- [ ] dotnet-ef tool version is 9.0.0

## Test Plan
- [ ] `dotnet build` succeeds
- [ ] `dotnet --version` shows 9.x
- [ ] `dotnet ef --version` shows 9.x
- [ ] Project references follow correct dependency direction

## Technical Notes
- Check ERROR-PREVENTION.md: ERROR #1 (SDK mismatch), ERROR #4 (package version mix)
- All EF Core packages must be 9.0.x
- Do NOT use .NET 10

## Files to Create/Modify
- [ ] `backend/global.json`
- [ ] `backend/FootballPrediction.sln`
- [ ] `backend/src/FootballPrediction.Domain/FootballPrediction.Domain.csproj`
- [ ] `backend/src/FootballPrediction.Application/FootballPrediction.Application.csproj`
- [ ] `backend/src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj`
- [ ] `backend/src/FootballPrediction.Api/FootballPrediction.Api.csproj`
- [ ] `backend/src/FootballPrediction.Api/Program.cs`
- [ ] `backend/tests/FootballPrediction.Tests/FootballPrediction.Tests.csproj`
