# Agent Delegation Guide

**Version**: 2.0
**Purpose**: Define how the Orchestrator agent delegates work to specialized agents
**Audience**: Orchestrator Agent (primary), Specialized Agents (secondary)

---

## 🎯 OVERVIEW

This guide defines:
- When to delegate vs. execute directly
- How to choose the right specialized agent
- Communication protocols between agents
- Quality assurance and handoff procedures
- Emergency escalation paths

**Core Principle**: The Orchestrator coordinates, delegates, and validates. Specialized agents execute with deep focus.

---

## 🤖 AGENT ROLES & RESPONSIBILITIES

### ORCHESTRATOR Agent (Master Coordinator)
**Role**: Master coordinator and quality gatekeeper

**Responsibilities**:
1. **Read and understand** the full project specification
2. **Plan** phase execution order and dependencies
3. **Delegate** work to appropriate specialized agents
4. **Monitor** progress and validate deliverables
5. **Integrate** work from multiple agents
6. **Enforce** quality gates (no proceeding with failing tests)
7. **Document** overall project progress
8. **Escalate** blockers that prevent progress

**Does NOT**:
- Write implementation code directly (delegates to specialized agents)
- Bypass validation gates
- Allow proceeding with failing tests or build errors

**Guide**: `.specs/agents/ORCHESTRATOR-AGENT.md`

---

### BACKEND Agent (Server-Side Development)
**Role**: .NET 9 Web API implementation

**Responsibilities**:
1. Create .NET solution structure (Clean Architecture)
2. Implement domain entities with EF Core
3. Create repositories and services
4. Build API controllers and endpoints
5. Implement authentication (JWT) and authorization
6. Write unit tests for backend code
7. Configure database (PostgreSQL, migrations)
8. Implement background jobs (Hangfire)
9. Set up SignalR hubs

**Specializes in**:
- C# / .NET 9
- Entity Framework Core 9
- PostgreSQL
- JWT authentication
- xUnit testing
- Moq for mocking
- Swagger/OpenAPI documentation

**Guide**: `.specs/agents/BACKEND-AGENT.md`

---

### FRONTEND Agent (Client-Side Development)
**Role**: Angular 19 PWA implementation

**Responsibilities**:
1. Create Angular 19 standalone application
2. Implement authentication UI (login/register)
3. Build match list components (upcoming, live, completed)
4. Create prediction form components
5. Implement leaderboard UI
6. Configure PWA features (service worker, manifest)
7. Implement offline support
8. Write frontend unit tests
9. Configure Tailwind CSS styling
10. Implement responsive design (mobile-first)

**Specializes in**:
- TypeScript / Angular 19
- Standalone components
- Signals API
- RxJS
- Tailwind CSS
- Service Workers
- Jasmine/Karma testing
- Responsive design

**Guide**: `.specs/agents/FRONTEND-AGENT.md`

---

### DEPLOYMENT Agent (Infrastructure & Deployment)
**Role**: Production deployment and configuration

**Responsibilities**:
1. Configure Vercel deployment (frontend)
2. Configure Render deployment (backend)
3. Set up PostgreSQL on Render
4. Configure environment variables
5. Set up CI/CD pipelines
6. Monitor deployment health
7. Troubleshoot deployment issues
8. Optimize production builds

**Specializes in**:
- Vercel configuration
- Render configuration
- Docker containerization
- Environment variable management
- Production troubleshooting
- SSL/TLS configuration
- Database connection strings

**Guide**: `.spec_v_2/agents/DEPLOYMENT-AGENT.md` (to be created)

---

### TESTING Agent (Quality Assurance)
**Role**: Comprehensive testing and validation

**Responsibilities**:
1. Design test strategies for each phase
2. Write unit tests (backend and frontend)
3. Create integration tests
4. Implement E2E tests (Cypress)
5. Execute validation checklists
6. Perform manual testing
7. Document test results
8. Identify testing gaps
9. Ensure 100% critical path coverage

**Specializes in**:
- xUnit (backend testing)
- Moq (mocking)
- Jasmine/Karma (frontend testing)
- Cypress (E2E testing)
- Test strategy design
- Coverage analysis
- Manual testing protocols

**Guide**: `.spec_v_2/agents/TESTING-AGENT.md` (to be created)

---

### CODE-REVIEWER Agent (Quality Assurance)
**Role**: Code quality validation

**Responsibilities**:
1. Review code for SOLID principles
2. Check for DRY violations
3. Ensure KISS principle followed
4. Verify proper error handling
5. Check security best practices
6. Validate code documentation
7. Ensure consistent code style
8. Identify potential bugs

**Specializes in**:
- Code quality assessment
- Design pattern recognition
- Security vulnerability detection
- Performance optimization opportunities
- Documentation completeness

**Guide**: `.specs/agents/CODE-REVIEWER-AGENT.md`

---

## 📋 DELEGATION DECISION MATRIX

### When to Delegate vs. Execute Directly

| Scenario | Action | Reason |
|----------|--------|--------|
| Creating .NET solution structure | **Delegate to BACKEND** | Complex setup requiring .NET expertise |
| Writing API controllers | **Delegate to BACKEND** | Backend code implementation |
| Creating Angular components | **Delegate to FRONTEND** | Frontend code implementation |
| Deploying to Vercel | **Delegate to DEPLOYMENT** | Infrastructure expertise needed |
| Writing unit tests | **Delegate to TESTING** | Testing expertise and thoroughness |
| Reviewing code quality | **Delegate to CODE-REVIEWER** | Objective quality assessment |
| Reading specification files | **Execute directly** | Orchestrator needs full context |
| Updating PROGRESS.md | **Execute directly** | Orchestrator tracks overall progress |
| Running validation checklists | **Execute directly or TESTING** | Can be done by either |
| Simple git operations | **Execute directly** | No specialized knowledge needed |
| Creating documentation | **Execute directly** | Orchestrator has full context |
| Debugging build errors | **Delegate to relevant agent** | Specialized knowledge needed |

### Phase-Specific Delegation

| Phase | Primary Agent | Secondary Agent(s) | Orchestrator Role |
|-------|---------------|-------------------|-------------------|
| 0: Setup | ORCHESTRATOR | None | Execute directly |
| 1: Backend Foundation | BACKEND | TESTING (validation) | Delegate + validate |
| 2: Authentication | BACKEND | TESTING (security) | Delegate + validate |
| 3: Scoring Logic | BACKEND | TESTING (unit tests) | Delegate + validate |
| 4: Tournament & Match | BACKEND | TESTING | Delegate + validate |
| 5: Prediction Submission | BACKEND | TESTING | Delegate + validate |
| 6: Leaderboard System | BACKEND | TESTING | Delegate + validate |
| 7: Frontend Foundation | FRONTEND | None | Delegate + validate |
| 8: Authentication UI | FRONTEND | TESTING | Delegate + validate |
| 9: Match Lists | FRONTEND | TESTING | Delegate + validate |
| 10: Prediction Form | FRONTEND | TESTING | Delegate + validate |
| 11: Leaderboard UI | FRONTEND | TESTING | Delegate + validate |
| 12: PWA Features | FRONTEND | TESTING | Delegate + validate |
| 13: football-data.org | BACKEND | TESTING | Delegate + validate |
| 14: Result Processing | BACKEND | TESTING | Delegate + validate |
| 15: Competition Features | BACKEND + FRONTEND | TESTING | Delegate + integrate |
| 16: Match Organization | BACKEND + FRONTEND | TESTING | Delegate + integrate |
| 17: Real-time Updates | BACKEND + FRONTEND | TESTING | Delegate + integrate |
| 18: Offline Support | FRONTEND | TESTING | Delegate + validate |
| 19: Production Deploy | DEPLOYMENT | TESTING (smoke tests) | Delegate + monitor |

---

## 📞 COMMUNICATION PROTOCOLS

### Delegation Message Format

When orchestrator delegates work:

```markdown
## DELEGATION: Phase {N} - {Task Name}

**To**: {AGENT_NAME} Agent
**Priority**: {HIGH/MEDIUM/LOW}
**Estimated Duration**: {X} hours
**Deadline**: {If applicable}

### Context
{Brief explanation of what needs to be done and why}

### Objective
{Specific, measurable objective for this delegation}

### Scope
**In Scope**:
- {Task 1}
- {Task 2}
- {Task 3}

**Out of Scope**:
- {Task A - will be handled separately}
- {Task B - deferred to later phase}

### Deliverables
1. {Deliverable 1 - specific and measurable}
2. {Deliverable 2 - specific and measurable}
3. {Deliverable 3 - specific and measurable}

### Requirements
- [ ] All code follows SOLID principles
- [ ] Unit tests written for all new code
- [ ] Build succeeds with 0 warnings, 0 errors
- [ ] Manual testing performed
- [ ] Documentation updated

### Resources
**Read these files first**:
- {File 1}
- {File 2}

**Reference implementation**: {If applicable}

**Known errors to avoid**: See ERROR-PREVENTION.md, errors {X, Y, Z}

### Validation Criteria
**How I will verify your work**:
1. {Validation check 1}
2. {Validation check 2}
3. {Validation check 3}

### Questions?
{Any clarifications needed before starting?}

---

**Orchestrator**: {Your name/ID}
**Delegation ID**: {Unique ID for tracking}
**Created**: {Timestamp}
```

### Completion Report Format

When specialized agent completes work:

```markdown
## COMPLETION REPORT: Phase {N} - {Task Name}

**From**: {AGENT_NAME} Agent
**To**: ORCHESTRATOR Agent
**Delegation ID**: {Matching ID from delegation}
**Status**: ✅ COMPLETE / ⚠️ PARTIAL / ❌ BLOCKED

### Summary
{Brief 2-3 sentence summary of what was accomplished}

### Deliverables Status
- [x] {Deliverable 1} - Complete
- [x] {Deliverable 2} - Complete
- [ ] {Deliverable 3} - Blocked (reason: {explanation})

### Implementation Details
**Files Created**: {X}
- {file_path_1} - {purpose}
- {file_path_2} - {purpose}

**Files Modified**: {Y}
- {file_path_3} - {changes made}
- {file_path_4} - {changes made}

**Lines of Code**: +{X} -{Y}

### Testing
**Tests Written**: {X} new tests
**Tests Passing**: {Y}/{Z} ({100}%)
**Coverage**: {X}%

**Test Details**:
```bash
{Command run to test}
{Test output summary}
```

### Build Status
**Backend**: ✅ 0 warnings, 0 errors / ❌ {X} errors
**Frontend**: ✅ 0 warnings, 0 errors / ❌ {X} errors

**Build Output**:
```bash
{Build command}
{Build output summary}
```

### Validation
**Manual Testing**: ✅ Performed / ❌ Not done
**Validation Checklist**: ✅ Complete / ⚠️ Partial ({X}/{Y} items)

**Manual Test Results**:
- {Test 1}: ✅ Pass
- {Test 2}: ✅ Pass
- {Test 3}: ❌ Fail (details: {explanation})

### Issues Encountered
**Total Issues**: {X}

**Issue 1**: {Brief title}
- **Time Lost**: {Y} minutes
- **Resolution**: {How it was fixed}
- **Documented in**: ERROR-PREVENTION.md

### Time Spent
- Implementation: {X}h
- Testing: {Y}h
- Debugging: {Z}h
- Documentation: {W}h
- **Total**: {T}h

### Documentation Updated
- [x] Code comments added (where needed)
- [x] PROGRESS.md updated
- [x] TEST-RESULTS.md updated
- [x] ERROR-PREVENTION.md updated (if errors)
- [ ] README.md updated (if needed)

### Next Steps
**Recommended next actions**:
1. {Action 1}
2. {Action 2}

**Blockers for next phase**: {None / List blockers}

### Ready for Integration
**Is this work ready to integrate?**: YES / NO

**If NO, what's needed**:
- {Item 1}
- {Item 2}

### Git Commit
**Committed**: YES / NO
**Commit hash**: {hash}
**Commit message**:
```
{commit message}
```

---

**Agent**: {Your name/ID}
**Completed**: {Timestamp}
**Duration**: {X} hours
```

### Status Update Format (for long tasks)

For tasks >2 hours, agent should send status updates:

```markdown
## STATUS UPDATE: Phase {N} - {Task Name}

**Delegation ID**: {ID}
**Progress**: {X}%

### Completed This Session
- [x] {Task 1}
- [x] {Task 2}

### In Progress
- [ ] {Task 3} - {X}% complete

### Remaining
- [ ] {Task 4}
- [ ] {Task 5}

### Issues
{Any blockers or issues}

### ETA
**Estimated completion**: {X} hours remaining

---

**Next update in**: {Y} minutes/hours
```

---

## 🔄 DELEGATION WORKFLOW

### Step-by-Step Delegation Process

#### 1. Orchestrator: Identify Need for Delegation
```markdown
Orchestrator reviews Phase {N} document and determines:
- This phase requires specialized expertise (Backend/Frontend/etc.)
- The work is substantial (>1 hour)
- I don't have deep expertise in this area
```

**Decision**: Delegate to {AGENT_NAME}

#### 2. Orchestrator: Prepare Delegation
```markdown
1. Read phase document completely
2. Identify specific deliverables
3. Extract requirements and validation criteria
4. Check ERROR-PREVENTION.md for relevant errors
5. Determine success criteria
6. Prepare delegation message (use format above)
```

#### 3. Orchestrator: Send Delegation
```markdown
Use Task tool to spawn specialized agent:

Task(
  description="Phase {N} - {Brief description}",
  prompt="{Full delegation message}",
  subagent_type="{backend-agent / frontend-agent / etc.}"
)
```

#### 4. Specialized Agent: Acknowledge & Execute
```markdown
Agent receives delegation and:
1. Reads all provided resources
2. Confirms understanding of scope and deliverables
3. Checks ERROR-PREVENTION.md for relevant warnings
4. Executes implementation following PHASE-WORKFLOW.md
5. Sends status updates (for long tasks)
6. Completes work and creates completion report
```

#### 5. Orchestrator: Validate Deliverables
```markdown
When agent reports completion:
1. Review completion report
2. Verify all deliverables marked complete
3. Run validation checks:
   - Build succeeds (dotnet build / npm run build)
   - Tests pass (dotnet test / npm test)
   - Application runs (dotnet run / npm start)
4. Execute validation checklist
5. Perform manual testing
6. Review code changes (git diff)
```

#### 6. Orchestrator: Accept or Request Revisions
```markdown
**If validation passes**:
- Accept work
- Update PROGRESS.md (phase complete)
- Proceed to next phase

**If validation fails**:
- Document specific failures
- Request revisions from agent
- Provide clear guidance on what needs fixing
- Re-validate after fixes
```

---

## 🚨 ESCALATION PROTOCOLS

### When to Escalate

Escalate when:
1. **Blocker encountered** that prevents progress >30 minutes
2. **Scope ambiguity** - unclear what to implement
3. **Technical impossibility** - requirement cannot be met with current tech stack
4. **Dependency missing** - blocked by external factor (API key, credentials, etc.)
5. **Test failures** that cannot be resolved
6. **Build errors** that cannot be fixed
7. **Deadline at risk** - estimated completion exceeds timeline

### Escalation Process

#### Level 1: Agent Self-Resolution (0-30 minutes)
```markdown
Agent attempts to resolve independently:
1. Check ERROR-PREVENTION.md for known error
2. Search documentation/online for solution
3. Try common fixes (rebuild, restart, clear cache)
4. Review recent changes for cause
```

#### Level 2: Escalation to Orchestrator (30-60 minutes)
```markdown
If unresolved after 30 minutes:

## ESCALATION: {Brief Issue Description}

**From**: {AGENT_NAME}
**Delegation ID**: {ID}
**Severity**: {HIGH/MEDIUM/LOW}
**Time Debugging**: {X} minutes

### Issue
{Detailed description of the problem}

### Error Message
```
{Full error message and stack trace}
```

### Context
- **What I was doing**: {Task description}
- **Command/action**: {What triggered the error}
- **Environment**: {OS, tool versions, etc.}

### Attempted Solutions
1. {Solution 1} - Result: {Failed because...}
2. {Solution 2} - Result: {Failed because...}
3. {Solution 3} - Result: {Failed because...}

### Impact
- **Blocking**: {What is blocked}
- **Workaround available**: YES / NO
- **Can continue with other tasks**: YES / NO

### Need Help With
{Specific question or guidance needed}
```

Orchestrator reviews and:
- Provides guidance/solution if known
- Delegates to different agent if needed
- Escalates to Level 3 if unknown

#### Level 3: External Escalation (>60 minutes)
```markdown
If orchestrator cannot resolve:

1. **Document thoroughly**:
   - Full error details
   - All attempted solutions
   - Impact on project timeline
   - Specific help needed

2. **Create GitHub issue** (if project has issue tracker)
   Or
   **Ask user for input** (if in interactive session)

3. **Implement workaround** (if possible):
   - Document workaround in ERROR-PREVENTION.md
   - Mark as temporary solution
   - Create task to revisit proper fix later

4. **Adjust project plan**:
   - If blocker cannot be resolved, adjust scope
   - Document decision in PROGRESS.md
   - Update phase deliverables accordingly
```

---

## 🎯 QUALITY ASSURANCE

### Orchestrator Validation Checklist

Before accepting work from specialized agent:

**Code Quality**:
- [ ] Code follows SOLID principles (check with CODE-REVIEWER)
- [ ] No DRY violations (repeated code)
- [ ] KISS principle followed (not over-engineered)
- [ ] Proper error handling implemented
- [ ] Security best practices followed

**Functionality**:
- [ ] All deliverables completed
- [ ] Manual testing performed successfully
- [ ] Edge cases handled
- [ ] Error states display properly

**Testing**:
- [ ] Unit tests written for all new code
- [ ] All tests passing (100%)
- [ ] Test coverage meets threshold
- [ ] Integration tests pass (if applicable)

**Build**:
- [ ] Backend builds with 0 warnings, 0 errors
- [ ] Frontend builds with 0 warnings, 0 errors
- [ ] No TypeScript errors
- [ ] No console errors in browser

**Documentation**:
- [ ] Code comments added (where needed)
- [ ] PROGRESS.md updated
- [ ] TEST-RESULTS.md updated
- [ ] ERROR-PREVENTION.md updated (if errors)
- [ ] README.md updated (if needed)

**Git**:
- [ ] Changes committed with clear message
- [ ] Commit message follows template
- [ ] No secrets committed
- [ ] Clean working directory

### Specialized Agent Self-Validation

Before reporting completion:

**Implementation**:
- [ ] All tasks from delegation completed
- [ ] Code follows SOLID, DRY, KISS principles
- [ ] Error handling implemented
- [ ] Edge cases handled

**Testing**:
- [ ] Unit tests written
- [ ] All tests passing locally
- [ ] Manual testing performed
- [ ] No obvious bugs

**Build**:
- [ ] Solution builds successfully
- [ ] 0 warnings, 0 errors
- [ ] Application runs without errors

**Documentation**:
- [ ] Code documented (where needed)
- [ ] Completion report prepared
- [ ] Issues documented (if any)

**Git**:
- [ ] Changes committed
- [ ] Commit message descriptive
- [ ] Ready to push

---

## 🔁 INTEGRATION WORKFLOW

### Multi-Agent Collaboration

For phases requiring multiple agents (e.g., Phase 15-17):

#### Orchestrator's Integration Role

**1. Plan Integration**:
```markdown
Phase {N} requires:
- BACKEND Agent: {Backend deliverables}
- FRONTEND Agent: {Frontend deliverables}

Integration points:
- {API endpoint X} → {Frontend component Y}
- {API endpoint Z} → {Frontend component W}
```

**2. Sequential vs. Parallel Delegation**:

**Sequential** (when dependent):
```markdown
1. Delegate backend work first (API must exist before frontend can call it)
2. Validate backend completion
3. Then delegate frontend work
4. Validate frontend completion
5. Test integration
```

**Parallel** (when independent):
```markdown
1. Delegate backend and frontend simultaneously
2. Both agents work independently
3. Validate each completion separately
4. Then test integration
```

**3. Integration Testing**:
```markdown
After both agents complete:

1. Start backend: `dotnet run --project src/FootballPrediction.Api`
2. Start frontend: `npm start`
3. Test integration points:
   - Frontend calls API successfully
   - Data displays correctly in UI
   - Error handling works end-to-end
4. Check browser console (no errors)
5. Check backend logs (no errors)
```

**4. Resolve Integration Issues**:
```markdown
If integration fails:

1. Identify the issue:
   - API not responding? → BACKEND problem
   - Data not displaying? → FRONTEND problem
   - CORS error? → BACKEND configuration
   - Type mismatch? → Contract misalignment

2. Delegate fix to appropriate agent

3. Re-test integration

4. Document issue in ERROR-PREVENTION.md
```

---

## 📊 DELEGATION METRICS

Track these metrics for process improvement:

**Per Delegation**:
- Time estimated: {X}h
- Time actual: {Y}h
- Accuracy: {X/Y ratio}
- Revisions required: {Z}
- Issues encountered: {W}

**Per Phase**:
- Delegations required: {X}
- Successful first-time: {Y}
- Required revisions: {Z}
- Integration issues: {W}

**Per Agent**:
- Total delegations: {X}
- Success rate: {Y}%
- Average completion time: {Z}h
- Common issues: {List}

**Overall Project**:
- Total phases: 20
- Phases delegated: {X}
- Phases executed directly: {Y}
- Average phase completion time: {Z}h
- Total revisions required: {W}

---

## ✅ DELEGATION SUCCESS CRITERIA

A delegation is **SUCCESSFUL** when:

1. ✅ All deliverables completed as specified
2. ✅ All validation checks pass
3. ✅ Tests passing (100%)
4. ✅ Build succeeds (0 warnings, 0 errors)
5. ✅ Manual testing confirms functionality
6. ✅ Documentation updated
7. ✅ Code follows quality standards
8. ✅ Changes committed with clear message
9. ✅ Completion report thorough and accurate
10. ✅ Ready to integrate with other work

---

## 🎯 QUICK REFERENCE

### Delegation Checklist

**Before Delegating**:
- [ ] Read phase document completely
- [ ] Identify clear deliverables
- [ ] Determine appropriate agent
- [ ] Check ERROR-PREVENTION.md for relevant errors
- [ ] Prepare delegation message
- [ ] Set clear validation criteria

**During Execution**:
- [ ] Monitor status updates (for long tasks)
- [ ] Be available for questions
- [ ] Review intermediate commits
- [ ] Provide guidance if asked

**After Completion**:
- [ ] Review completion report
- [ ] Validate all deliverables
- [ ] Run tests
- [ ] Perform manual testing
- [ ] Accept or request revisions
- [ ] Update PROGRESS.md
- [ ] Document lessons learned

### Common Delegation Patterns

**Simple Backend Feature**:
```
ORCHESTRATOR → BACKEND Agent
Validates with: Build + Tests + Manual API test
```

**Simple Frontend Feature**:
```
ORCHESTRATOR → FRONTEND Agent
Validates with: Build + Tests + Manual UI test
```

**Full-Stack Feature**:
```
ORCHESTRATOR → BACKEND Agent (API)
            → FRONTEND Agent (UI)
            → Integration testing
Validates each separately, then integration
```

**Complex Feature with Testing**:
```
ORCHESTRATOR → BACKEND/FRONTEND Agent (implementation)
            → TESTING Agent (comprehensive tests)
            → CODE-REVIEWER Agent (quality check)
Validates at each step
```

---

**Version**: 2.0
**Created**: 2026-03-05
**Last Updated**: 2026-03-05
**Purpose**: Ensure effective delegation and collaboration
**Target**: Orchestrator Agent (primary), All Agents (secondary)
