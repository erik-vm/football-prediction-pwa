# TICKET-010: Prediction CRUD + Validation

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-006, TICKET-009
**User Story**: US-010, US-011, US-012
**Complexity**: L
**Critical path**: YES

## Description
PredictionService + PredictionController with CRUD, kickoff validation, duplicate prevention, and JWT auth requirement.

## Acceptance Criteria
- [ ] IPredictionService interface in Application
- [ ] PredictionService in Infrastructure
- [ ] PredictionController at /api/v1/predictions with [Authorize]
- [ ] GET /{id} returns prediction or 404
- [ ] GET /my?userId={guid} returns user's predictions
- [ ] GET /match/{matchId} returns current user's prediction for that match
- [ ] POST / creates prediction: validates before kickoff, no duplicate (409), score range 0-10
- [ ] PUT /{id} updates prediction: only before kickoff
- [ ] DELETE /{id} deletes prediction: only before kickoff
- [ ] Prediction saved with status "PENDING" and CompetitionCode from match
- [ ] Unique constraint (UserId, MatchId) enforced at DB level
- [ ] Server-side validation: score range 0-10
- [ ] All endpoints require JWT authentication

## Test Plan
- [ ] Unit: Create prediction before kickoff succeeds
- [ ] Unit: Create prediction after kickoff rejected
- [ ] Unit: Duplicate prediction returns 409
- [ ] Unit: Score outside 0-10 rejected
- [ ] Unit: Update prediction before kickoff succeeds
- [ ] Unit: Update prediction after kickoff rejected
- [ ] Unit: Delete prediction before kickoff succeeds
- [ ] Unit: Get user predictions returns correct results

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/DTOs/PredictionDto.cs`
- [ ] `backend/src/FootballPrediction.Application/DTOs/PredictionRequest.cs`
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IPredictionService.cs`
- [ ] `backend/src/FootballPrediction.Application/Validators/PredictionRequestValidator.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/PredictionService.cs`
- [ ] `backend/src/FootballPrediction.Api/Controllers/PredictionController.cs`
