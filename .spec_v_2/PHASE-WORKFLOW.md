# Phase Execution Workflow

**Version**: 2.0
**Purpose**: Standard workflow for executing any phase from 0-19
**Target Audience**: All agents (Orchestrator, Backend, Frontend, Deployment, Testing)

---

## 🎯 OVERVIEW

This document defines the **EXACT** workflow that MUST be followed when executing any phase of the Football Prediction PWA build. This workflow ensures:
- ✅ No steps are missed
- ✅ All validation passes before proceeding
- ✅ Documentation stays current
- ✅ Errors are prevented through pre-checks
- ✅ Quality gates are enforced

**CRITICAL**: You MUST NOT skip any step in this workflow. Each step has a purpose and builds on previous steps.

---

## 📋 PHASE EXECUTION STEPS

### Step 1: Pre-Phase Preparation (10 minutes)

#### 1.1 Read Phase Documentation
```markdown
Read these files IN ORDER:
1. `.spec_v_2/phases/PHASE-{NN}-{NAME}.md` (or PHASE-SUMMARY.md)
2. `.spec_v_2/validation/PHASE-{NN}-VALIDATION.md` (or VALIDATION-TEMPLATE.md)
3. `.spec_v_2/ERROR-PREVENTION.md` (focus on this phase's errors)
```

#### 1.2 Verify Prerequisites
```bash
# Check git status (must be clean or only tracking files)
git status

# Verify previous phase completed
# Check PROGRESS.md: Phase {N-1} status must be ✅

# Verify tools installed
dotnet --version        # Must be 9.0.x
node --version          # Must be 20.x.x
npm --version           # Must be 10.x.x
docker --version        # Must be installed
```

#### 1.3 Run Error Prevention Checks
Read ERROR-PREVENTION.md and execute ALL prevention commands for this phase.

**Example for Phase 1**:
```bash
# Check dotnet-ef version
dotnet ef --version  # Must be 9.0.0

# If wrong version, fix it:
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0
```

#### 1.4 Update PROGRESS.md
```markdown
Mark phase status as ⏳ In Progress:
### Phase {N}: {Name} ⏳
**Status:** In Progress
**Started:** {TODAY}
```

**Checklist**:
- [ ] Phase documentation read and understood
- [ ] Prerequisites verified (previous phase complete, tools correct version)
- [ ] Error prevention checks executed
- [ ] PROGRESS.md updated to "In Progress"
- [ ] Clean working directory confirmed

---

### Step 2: Implementation (60-80% of phase time)

#### 2.1 Follow Phase Document Exactly
- Execute tasks **IN THE ORDER** specified in the phase document
- Do NOT skip steps
- Do NOT take shortcuts
- Do NOT assume configuration

#### 2.2 Create Todo List
Use TodoWrite to track all tasks for this phase:
```json
[
  {"content": "Task 1 from phase doc", "status": "in_progress", "activeForm": "..."},
  {"content": "Task 2 from phase doc", "status": "pending", "activeForm": "..."},
  {"content": "Task 3 from phase doc", "status": "pending", "activeForm": "..."}
]
```

#### 2.3 Implementation Pattern
For each task:

**a) Before starting:**
- Read the task requirements
- Identify files to create/modify
- Understand expected outcome

**b) During implementation:**
- Write code following SOLID principles
- Add inline comments ONLY if complex logic
- Keep changes minimal (DRY, KISS principles)
- Test incrementally (don't write all code then test)

**c) After completing:**
- Mark todo as completed
- Verify the specific deliverable works
- Document any issues encountered

#### 2.4 Continuous Validation
After EVERY major task (entity creation, endpoint creation, component creation):

```bash
# Backend changes
cd backend
dotnet build  # Must succeed with 0 warnings

# Frontend changes
cd frontend
npm run build  # Must succeed with 0 errors
```

**If build fails**: STOP, fix the issue, then continue. Do NOT accumulate build errors.

#### 2.5 Documentation as You Go
When you encounter an error:

**a) Document immediately:**
- Error message (full text)
- Command that caused it
- Root cause
- Working solution

**b) Update ERROR-PREVENTION.md:**
```markdown
### ❌ ERROR {N}: {Title}
**Phase**: {Current phase}
**Time Lost**: {X} minutes
**Severity**: {HIGH/MEDIUM/LOW}

[Full documentation as per template]
```

**c) Update phase document (if needed):**
Add warning or note to help next agent avoid this error.

**Checklist**:
- [ ] All tasks from phase document executed in order
- [ ] Todo list maintained (all tasks marked completed)
- [ ] Code follows SOLID, DRY, KISS principles
- [ ] Continuous build validation passed (0 warnings/errors)
- [ ] All errors documented in ERROR-PREVENTION.md
- [ ] Implementation notes added to PROGRESS.md

---

### Step 3: Testing & Validation (15-20% of phase time)

#### 3.1 Run All Tests
```bash
# Backend tests
cd backend
dotnet test --verbosity normal

# Frontend tests (if applicable)
cd frontend
npm test -- --watch=false --browsers=ChromeHeadless

# Integration tests (if applicable)
npm run test:e2e
```

**Expected**: ALL tests pass. If any fail:
1. Investigate failure
2. Fix the issue
3. Re-run tests
4. Do NOT proceed until 100% passing

#### 3.2 Execute Validation Checklist
Open `.spec_v_2/validation/PHASE-{NN}-VALIDATION.md` and execute EVERY check:

**Critical sections**:
- ✅ Deliverables Checklist (all items must be checked)
- ✅ Build Validation (0 warnings, 0 errors)
- ✅ Test Validation (100% passing)
- ✅ Functional Validation (manual testing)
- ✅ Database Validation (if applicable)
- ✅ Security Validation (if applicable)
- ✅ Integration Validation

#### 3.3 Manual Testing
For each deliverable in the phase:

**Backend deliverables** (API endpoints):
```bash
# Test each endpoint manually with curl
curl -X GET http://localhost:5000/api/endpoint

# Test error cases (invalid input, unauthorized access)
curl -X POST http://localhost:5000/api/endpoint -d '{"invalid": "data"}'

# Verify database state
docker exec football_prediction_db psql -U postgres -d football_prediction -c 'SELECT * FROM "TableName";'
```

**Frontend deliverables** (UI components):
```bash
# Start dev server
npm start

# Manual checks in browser:
# - Component renders correctly
# - Responsive design works (mobile/tablet/desktop)
# - Error states display properly
# - Loading states display properly
# - User interactions work as expected
```

#### 3.4 Update TEST-RESULTS.md
```bash
# Copy TEST-RESULTS-template.md if not exists
# Update with actual test results

Total Tests: {X}
Passing: {Y}
Failing: 0  # MUST be 0
Coverage: {Z}%
```

**Checklist**:
- [ ] All automated tests passing (backend, frontend, integration)
- [ ] Validation checklist 100% complete
- [ ] Manual testing performed for all deliverables
- [ ] TEST-RESULTS.md updated
- [ ] No failing tests or validation items

---

### Step 4: Documentation Update (5-10% of phase time)

#### 4.1 Update PROGRESS.md
```markdown
### Phase {N}: {Name} ✅
**Status:** Complete
**Started:** {START_DATE}
**Completed:** {TODAY}
**Duration:** {X} hours

#### Tasks
- [x] Task 1
- [x] Task 2
- [x] Task 3

**Deliverables:**
- {Deliverable 1 complete}
- {Deliverable 2 complete}

**Notes:**
- {Key observations, challenges overcome, solutions applied}

**Blockers:**
- None

**Time Breakdown:**
- Productive: {X}h
- Debugging: {Y}h
- Total: {Z}h
```

Update progress summary section:
```markdown
**Phases Complete**: {X+1} / 20 ({percentage}%)
```

#### 4.2 Create Session Analysis (if complex phase)
If phase took >2 hours or encountered significant errors:

```bash
# Copy SESSION-ANALYSIS-template.md
# Fill in all sections documenting the session
# Save to: .analysis/{YYYY-MM-DD}-phase-{NN}-{name}.md
```

#### 4.3 Update README.md (if needed)
If phase added new features or changed how to run the app:
- Update setup instructions
- Update API documentation links
- Update deployment instructions

#### 4.4 Update Swagger/API Docs (backend phases)
If new endpoints were created:
```csharp
// Ensure all controllers have XML comments
/// <summary>
/// Brief description of endpoint
/// </summary>
/// <param name="id">Parameter description</param>
/// <returns>Return value description</returns>
[HttpGet("{id}")]
public async Task<ActionResult<Response>> GetById(int id)
```

**Checklist**:
- [ ] PROGRESS.md fully updated (phase marked ✅, deliverables listed, times recorded)
- [ ] Session analysis created (if complex phase)
- [ ] README.md updated (if needed)
- [ ] API documentation current (Swagger XML comments)
- [ ] Progress summary percentages updated

---

### Step 5: Git Commit (5 minutes)

#### 5.1 Review Changes
```bash
# See all modified files
git status

# See all changes
git diff

# Review recent commits to understand commit message style
git log --oneline -10
```

#### 5.2 Stage Changes
```bash
# Add all relevant files
git add src/
git add frontend/
git add PROGRESS.md
git add TEST-RESULTS.md
git add .spec_v_2/  # If updated error prevention or phase docs
```

**IMPORTANT**: Do NOT commit:
- `.env` files
- `credentials.json`
- `appsettings.Development.json` with secrets
- `node_modules/`
- `bin/`, `obj/` directories

#### 5.3 Create Commit Message
Follow `.spec_v_2/templates/COMMIT-MESSAGE-template.md`:

```bash
git commit -m "$(cat <<'EOF'
feat: Phase {N} - {Name} complete

Implemented {brief summary of phase deliverables}.

Deliverables:
- {Deliverable 1}
- {Deliverable 2}
- {Deliverable 3}

Tests: {X} passing ({+Y} new tests)
Build: ✅ 0 warnings, 0 errors

Next: Phase {N+1}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### 5.4 Push to Remote
```bash
# Push to branch
git push origin {branch_name}

# Verify push succeeded
git status  # Should show "Your branch is up to date"
```

**Checklist**:
- [ ] All changes reviewed (git status, git diff)
- [ ] Only relevant files staged (no secrets, no build artifacts)
- [ ] Commit message follows template
- [ ] Commit message is descriptive and accurate
- [ ] Changes pushed to remote successfully
- [ ] Git status shows clean working directory

---

### Step 6: Phase Sign-Off (2 minutes)

#### 6.1 Final Verification
Run the complete verification suite:

```bash
# Backend verification
cd backend
dotnet build
dotnet test

# Frontend verification (if applicable)
cd frontend
npm run build
npm test -- --watch=false --browsers=ChromeHeadless

# Application still runs
dotnet run --project src/FootballPrediction.Api  # Backend
npm start  # Frontend (in separate terminal)

# Manual smoke test in browser
# - Application loads
# - No console errors
# - Basic functionality works
```

#### 6.2 Checklist Review
Review this complete checklist:

**Pre-Phase**:
- [ ] Phase docs read
- [ ] Prerequisites verified
- [ ] Error prevention checks executed
- [ ] PROGRESS.md updated to "In Progress"

**Implementation**:
- [ ] All tasks executed in order
- [ ] Code follows SOLID, DRY, KISS
- [ ] Continuous validation passed
- [ ] Errors documented

**Testing & Validation**:
- [ ] All tests passing (100%)
- [ ] Validation checklist complete
- [ ] Manual testing performed
- [ ] TEST-RESULTS.md updated

**Documentation**:
- [ ] PROGRESS.md complete
- [ ] Session analysis created (if needed)
- [ ] README.md updated (if needed)
- [ ] API docs current

**Git**:
- [ ] Changes committed with clear message
- [ ] Changes pushed to remote
- [ ] Clean working directory

**Final Verification**:
- [ ] Application builds successfully
- [ ] All tests passing
- [ ] Application runs without errors

#### 6.3 Phase Transition
If ALL checklists are complete:

**Update PROGRESS.md**:
```markdown
### Phase {N}: {Name} ✅
**Status:** Complete

### Phase {N+1}: {Next Phase Name} 📅
**Status:** Ready to start
```

**Announce completion** (if orchestrator is delegating):
```markdown
Phase {N} complete. All validation passed.
Ready to proceed to Phase {N+1}.

Summary:
- Deliverables: {X}/{X} complete
- Tests: {Y} passing
- Build: 0 warnings, 0 errors
- Duration: {Z} hours
```

#### 6.4 Pause Point (if needed)
If this is a good stopping point:

**Create handoff document**:
```markdown
## Session Handoff

**Last completed phase**: {N}
**Next phase**: {N+1}
**Branch**: {branch_name}
**Status**: ✅ Ready to continue

**How to resume**:
1. `git checkout {branch_name}`
2. `git pull origin {branch_name}`
3. Read `.spec_v_2/phases/PHASE-{N+1}-{NAME}.md`
4. Follow PHASE-WORKFLOW.md starting at Step 1
5. Execute Phase {N+1}

**Notes for next session**:
- {Any important context}
- {Any warnings or things to watch out for}
```

**Checklist**:
- [ ] Final verification passed (build, tests, application runs)
- [ ] All checklists reviewed and complete
- [ ] PROGRESS.md shows phase ✅ complete, next phase 📅 ready
- [ ] Phase completion announced (if applicable)
- [ ] Handoff document created (if pausing)

---

## 🚨 FAILURE PROTOCOL

### If Any Step Fails

**DO NOT PROCEED**. Follow this protocol:

#### 1. Document the Failure
```markdown
## Failure Report

**Phase**: {N}
**Step**: {Step number and name}
**What failed**: {Description}
**Error message**:
```
{full error message}
```

**Context**:
- Command run: {command}
- Files modified: {list}
- Environment: {OS, tools, versions}
```

#### 2. Analyze Root Cause
Ask these questions:
- What was I trying to accomplish?
- What command/action triggered the failure?
- Is this a known error (check ERROR-PREVENTION.md)?
- What changed recently that might cause this?
- Is this an environment issue or code issue?

#### 3. Attempt Resolution
**If known error**:
- Follow solution in ERROR-PREVENTION.md
- Verify fix worked
- Continue from current step

**If unknown error**:
- Search error message online
- Check documentation for tool/framework
- Try common fixes (rebuild, restart, clear cache)
- Document attempts in session analysis

#### 4. Escalate if Stuck (>30 minutes)
If you cannot resolve in 30 minutes:

**Create escalation report**:
```markdown
## Escalation: Phase {N} Blocked

**Time spent debugging**: {X} minutes
**Error**: {brief description}
**Attempted solutions**:
1. {Solution 1} - Result: {failed because...}
2. {Solution 2} - Result: {failed because...}
3. {Solution 3} - Result: {failed because...}

**Blocking**: Cannot proceed to next step

**Need help with**: {specific question}

**Error details**: [Link to full error documentation]
```

#### 5. When Fixed
**Update documentation**:
- Add to ERROR-PREVENTION.md (if new error)
- Update phase document with warning
- Add to validation checklist (preventive check)
- Document in session analysis

**Resume workflow**:
- Re-execute failed step
- Verify success
- Continue with next step

---

## ⏭️ SPECIAL CASES

### Case 1: Long-Running Phase (>4 hours)
If phase will take >4 hours:

**Break into sub-sessions**:
1. Complete logical group of tasks (e.g., entities, then repositories, then services)
2. Commit after each sub-session
3. Update PROGRESS.md with sub-session notes
4. Create mini session analysis if errors encountered

**Example for Phase 1**:
- Sub-session 1: Solution setup + entities (1.5h)
- Sub-session 2: Repositories + DbContext (1.5h)
- Sub-session 3: Migrations + verification (1h)

### Case 2: Phase Requires External Setup (e.g., football-data.org API)
If phase requires external services:

**Pre-phase setup**:
1. Obtain API keys/credentials
2. Store in local .env (DO NOT commit)
3. Verify API accessible
4. Document in PROGRESS.md notes

### Case 3: Database Migrations
For phases with database changes:

**Always use SQL script method**:
```bash
# Create migration
dotnet ef migrations add {MigrationName} --startup-project ../FootballPrediction.Api

# Generate SQL script (safer than 'database update')
dotnet ef migrations script --output migration.sql --startup-project ../FootballPrediction.Api

# Review SQL (make sure it's correct)
cat migration.sql

# Apply to database
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration.sql

# Verify
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'
```

### Case 4: Merge Conflicts
If git pull results in merge conflicts:

**Resolution steps**:
```bash
# See conflicted files
git status

# For each conflicted file:
# 1. Open in editor
# 2. Resolve conflicts (keep both changes if needed)
# 3. Remove conflict markers (<<<<<<, ======, >>>>>>)
# 4. Test that code still works
# 5. Stage resolved file
git add {resolved_file}

# Complete merge
git commit -m "chore: resolve merge conflicts from {branch}"

# Verify application still works
dotnet build && dotnet test  # Backend
npm run build && npm test    # Frontend
```

### Case 5: Test Failures
If tests fail during validation:

**Debugging steps**:
```bash
# Run tests with detailed output
dotnet test --verbosity detailed  # Backend
npm test -- --no-coverage         # Frontend (shows full output)

# Run single failing test
dotnet test --filter "FullyQualifiedName~{TestName}"

# Debug specific test:
# 1. Add breakpoint in test code
# 2. Run test in debug mode
# 3. Step through to find issue

# Common fixes:
# - Test data incorrect (verify expected vs actual)
# - Service not registered in DI (check Program.cs)
# - Mock not configured (verify mock setup)
# - Async issue (ensure await on async calls)
```

---

## 📊 WORKFLOW METRICS

Track these metrics for each phase:

**Time Metrics**:
- Total time: {X}h
- Implementation time: {Y}h ({Z}%)
- Testing time: {A}h ({B}%)
- Debugging time: {C}h ({D}%)
- Documentation time: {E}h ({F}%)

**Quality Metrics**:
- Tests passing: {X}/{Y} ({100}%)
- Build warnings: 0
- Build errors: 0
- Code coverage: {X}%

**Efficiency Metrics**:
- Tasks completed: {X}/{Y} ({100}%)
- Errors encountered: {Z}
- Time lost to errors: {W} minutes
- Commits made: {V}

**Target Metrics** (for a healthy phase execution):
- Debugging time: <20% of total
- Implementation time: >60% of total
- Tests passing: 100%
- Build warnings: 0
- Build errors: 0

---

## ✅ WORKFLOW SUCCESS CRITERIA

A phase is **SUCCESSFULLY COMPLETE** when:

1. ✅ All deliverables from phase document implemented
2. ✅ All tests passing (100%)
3. ✅ Build succeeds with 0 warnings, 0 errors
4. ✅ Validation checklist 100% complete
5. ✅ Manual testing confirms functionality works
6. ✅ PROGRESS.md updated (phase marked ✅)
7. ✅ TEST-RESULTS.md updated
8. ✅ Session analysis created (if needed)
9. ✅ Changes committed with clear message
10. ✅ Changes pushed to remote
11. ✅ Application runs without errors
12. ✅ Ready to proceed to next phase

**If ANY criteria fails**: Phase is NOT complete. Fix the issue and re-validate.

---

## 🎯 QUICK REFERENCE

### Phase Execution Checklist
Use this as a quick reference during execution:

- [ ] **PRE-PHASE**: Docs read, prerequisites verified, error checks run, PROGRESS.md updated
- [ ] **IMPLEMENTATION**: Tasks executed in order, code follows principles, builds continuously, errors documented
- [ ] **TESTING**: All tests pass, validation checklist complete, manual testing done, TEST-RESULTS.md updated
- [ ] **DOCUMENTATION**: PROGRESS.md complete, session analysis created (if needed), README updated (if needed)
- [ ] **GIT**: Changes committed, message follows template, pushed to remote
- [ ] **SIGN-OFF**: Final verification passed, all checklists complete, ready for next phase

### Common Commands Reference

**Build**:
```bash
dotnet build                    # Backend
npm run build                   # Frontend
```

**Test**:
```bash
dotnet test                     # Backend
npm test                        # Frontend
```

**Run**:
```bash
dotnet run --project src/FootballPrediction.Api    # Backend
npm start                                          # Frontend
```

**Database**:
```bash
# Create migration
dotnet ef migrations add {Name} --startup-project ../FootballPrediction.Api

# Generate SQL script
dotnet ef migrations script --output migration.sql --startup-project ../FootballPrediction.Api

# Apply to database
docker exec -i football_prediction_db psql -U postgres -d football_prediction < migration.sql

# Query database
docker exec football_prediction_db psql -U postgres -d football_prediction -c '{SQL}'
```

**Git**:
```bash
git status                      # See changes
git diff                        # See exact changes
git add {files}                 # Stage changes
git commit -m "message"         # Commit
git push origin {branch}        # Push to remote
```

---

**Version**: 2.0
**Created**: 2026-03-05
**Last Updated**: 2026-03-05
**Purpose**: Ensure consistent, high-quality phase execution
**Target**: All agents executing phases 0-19
