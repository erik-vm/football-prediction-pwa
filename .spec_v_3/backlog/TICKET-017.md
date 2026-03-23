# TICKET-017: Prediction Form UI

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Frontend Developer
**Depends on**: TICKET-016, TICKET-010
**User Story**: US-010, US-011
**Complexity**: M
**Critical path**: YES

## Description
Prediction form page with score inputs, countdown timer, edit mode, and submission validation.

## Acceptance Criteria
- [ ] Prediction form at /predictions/new?matchId= (protected route)
- [ ] Shows match info header: teams, kickoff time
- [ ] Score inputs: +/- buttons with numbers (0-10) for home and away
- [ ] Cyan colored score input boxes (per mockup)
- [ ] Countdown timer to deadline (updates every 30s)
- [ ] Countdown format: "Deadline in Xh Xm" or "Deadline in Xm"
- [ ] Points Breakdown info section: Exact score +5, Correct winner +3, Correct goal difference +2
- [ ] "Save Prediction" button
- [ ] Edit mode: pre-fills existing scores if prediction exists
- [ ] Prevents submission after kickoff (client-side check + server validates)
- [ ] On success: navigate back to /matches
- [ ] On error: display error message
- [ ] PredictionService for create/update API calls
- [ ] UI matches make_prediction_view.png mockup

## Test Plan
- [ ] Unit: Score inputs constrained to 0-10
- [ ] Unit: Countdown displays correctly
- [ ] Unit: Edit mode pre-fills existing scores
- [ ] Unit: Submit disabled after kickoff
- [ ] Unit: Successful save navigates to /matches

## Files to Create/Modify
- [ ] `frontend/src/app/features/predictions/prediction-form/prediction-form.component.ts`
- [ ] `frontend/src/app/features/predictions/prediction-form/prediction-form.component.html`
- [ ] `frontend/src/app/core/services/prediction.service.ts`
- [ ] `frontend/src/app/shared/models/prediction.model.ts`
