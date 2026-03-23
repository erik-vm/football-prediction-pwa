# TICKET-013: Background Jobs (Sync + Scoring)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Backend Developer
**Depends on**: TICKET-007, TICKET-012
**User Story**: US-013, US-022
**Complexity**: M
**Critical path**: YES

## Description
Two IHostedService background jobs: FootballDataSyncJob (60min) and ResultProcessingBackgroundJob (30min safety net). Both must trigger scoring after sync.

## Acceptance Criteria
- [ ] FootballDataSyncJob: IHostedService, runs every 60 minutes (configurable)
- [ ] FootballDataSyncJob: calls SyncAllCompetitionsAsync, then ScorePendingPredictionsAsync — ERROR #16
- [ ] ResultProcessingBackgroundJob: IHostedService, runs every 30 minutes
- [ ] ResultProcessingBackgroundJob: finds FINISHED matches with unscored PENDING predictions, scores them
- [ ] Both jobs have error handling (catch, log, continue)
- [ ] Both jobs registered in DI/Program.cs
- [ ] Scoring is idempotent (never double-scores SCORED predictions)
- [ ] ResultProcessingService: ProcessFinishedMatchesAsync (batch scoring safety net)

## Test Plan
- [ ] Unit: Sync job calls sync then scoring
- [ ] Unit: Safety net finds and scores missed predictions
- [ ] Unit: Already SCORED predictions not re-processed
- [ ] Unit: Job continues after error in single competition

## Technical Notes
- CRITICAL: ERROR #16 — ScorePendingPredictions must be called in BOTH sync paths
- Jobs should log start/end times and any errors
- Sync interval configurable via appsettings.json

## Files to Create/Modify
- [ ] `backend/src/FootballPrediction.Application/Interfaces/Services/IResultProcessingService.cs`
- [ ] `backend/src/FootballPrediction.Infrastructure/Services/ResultProcessingService.cs`
- [ ] `backend/src/FootballPrediction.Api/BackgroundJobs/FootballDataSyncJob.cs`
- [ ] `backend/src/FootballPrediction.Api/BackgroundJobs/ResultProcessingBackgroundJob.cs`
- [ ] `backend/src/FootballPrediction.Api/Program.cs` (register hosted services)
