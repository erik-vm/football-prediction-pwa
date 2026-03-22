# 🎯 ORCHESTRATOR AGENT - START HERE

**Version**: 2.0
**Purpose**: Autonomous application builder - Rebuild Football Prediction PWA from scratch
**Last Updated**: 2026-03-05

---

## 🤖 YOU ARE THE ORCHESTRATOR

You are the **Master Orchestrator Agent** - responsible for coordinating the complete rebuild of a production-ready Football Prediction PWA application from zero to deployment.

**Your Mission**: Build a fully functional application matching the reference implementation with minimal human intervention.

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting ANY work, verify:

- [ ] You have read this entire document (START-HERE.md)
- [ ] You understand your role as orchestrator
- [ ] You know how to delegate to specialized agents
- [ ] You have access to the reference project structure
- [ ] You understand the phase-by-phase workflow

**DO NOT PROCEED** until all boxes are checked.

---

## 🎯 YOUR PRIMARY RESPONSIBILITIES

### 1. **Project Initialization**
- Create clean directory structure
- Initialize git repository
- Create tracking documents (PROGRESS.md, TEST-RESULTS.md)
- Set up development branch

### 2. **Phase Management**
- Execute phases in strict sequential order (0 → 26)
- Delegate tasks to specialized agents
- Validate phase completion before proceeding
- Document progress continuously

### 3. **Quality Control**
- Ensure all tests pass before moving forward
- Validate against reference implementation
- Maintain code quality standards (SOLID, DRY, KISS)
- Zero tolerance for failing builds

### 4. **Error Prevention**
- Apply lessons learned from `.analysis/` folder
- Check prerequisites before each phase
- Validate tool versions
- Prevent known blockers

### 5. **Documentation**
- Update PROGRESS.md after each phase
- Create session analysis for complex phases
- Keep TEST-RESULTS.md current
- Document all architectural decisions

---

## 📖 CRITICAL DOCUMENTS TO READ (IN ORDER)

### Step 1: Understand the Project (15 minutes)
Read these documents to understand WHAT you're building:

1. **`REFERENCE.md`** - Overview of the reference application
2. **`GAME-RULES.md`** - Scoring algorithm (MUST match exactly!)
3. **`REQUIREMENTS.md`** - Functional requirements
4. **`TECH-STACK.md`** - Technology choices

### Step 2: Understand How to Build (10 minutes)
Read these to understand HOW to build it:

5. **`ARCHITECTURE.md`** - System architecture and patterns
6. **`PROJECT-STRUCTURE.md`** - Folder organization
7. **`ERROR-PREVENTION.md`** - Common pitfalls and solutions

### Step 3: Understand the Workflow (10 minutes)
Read these to understand the PROCESS:

8. **`PHASE-WORKFLOW.md`** - Phase-by-phase execution plan
9. **`AGENT-DELEGATION.md`** - How to delegate to specialized agents
10. **`VALIDATION-CHECKLIST.md`** - Quality gates for each phase

---

## 🚀 EXECUTION WORKFLOW

### Phase 0: Project Setup (30 minutes)
**Objective**: Create clean project structure

**Tasks**:
1. Create root directory: `football-prediction-pwa-new/`
2. Initialize git: `git init && git commit --allow-empty -m "Initial commit"`
3. Create branch: `git checkout -b development`
4. Create tracking documents:
   - `PROGRESS.md` (copy template from `templates/PROGRESS-template.md`)
   - `TEST-RESULTS.md` (copy template from `templates/TEST-RESULTS-template.md`)
5. Create `.gitignore` files for .NET and Angular
6. Initial commit: "chore: Initialize project structure"

**Delegation**: Self (orchestrator handles setup)

**Validation**:
- [ ] Git repository initialized
- [ ] Development branch created
- [ ] Tracking documents created
- [ ] Clean git status

**Next**: Proceed to Phase 1

---

### Phase 1: Backend Foundation (2-3 hours)
**Objective**: Create .NET 9 solution with Clean Architecture

**Delegate to**: `BACKEND-AGENT`

**Agent Instructions**:
```
Read: agents/BACKEND-AGENT.md
Execute: phases/PHASE-01-BACKEND-FOUNDATION.md
Apply: error-prevention/PHASE-01-PREVENTION.md (dotnet-ef version, package versions)
```

**Deliverables**:
- 6 .NET projects (Api, Application, Domain, Infrastructure, UnitTests, IntegrationTests)
- Entity Framework Core configured
- PostgreSQL connection working
- 5 database tables created
- Health check endpoint functional
- Solution builds with 0 warnings

**Validation Checklist**: See `validation/PHASE-01-CHECKLIST.md`

**Common Errors to Prevent**:
- ❌ dotnet-ef v10 with .NET 9 project → Use v9.0.0
- ❌ Package version mismatches → Use versions from TECH-STACK.md
- ❌ EF migration application failures → Use SQL script method

**Next**: Proceed to Phase 2 only if all validations pass

---

### Phase 2: Authentication & Authorization (3-4 hours)
**Objective**: JWT authentication with BCrypt password hashing

**Delegate to**: `BACKEND-AGENT`

**Agent Instructions**:
```
Read: agents/BACKEND-AGENT.md
Execute: phases/PHASE-02-AUTHENTICATION.md
Apply: error-prevention/PHASE-02-PREVENTION.md (port conflicts)
```

**Deliverables**:
- JWT token generation service
- User registration endpoint
- User login endpoint
- Refresh token mechanism
- BCrypt password hashing (work factor 12)
- FluentValidation configured

**Validation Checklist**: See `validation/PHASE-02-CHECKLIST.md`

**Common Errors to Prevent**:
- ❌ Port 5432 conflict (Docker + Windows PostgreSQL) → Use port 5433
- ❌ Missing RefreshToken columns → Run migrations on correct database

**Next**: Proceed to Phase 3

---

### Phase 3: Core Scoring Logic (2 hours)
**Objective**: Implement exact scoring algorithm

**Delegate to**: `BACKEND-AGENT`

**Agent Instructions**:
```
Read: GAME-RULES.md (CRITICAL - must match exactly!)
Execute: phases/PHASE-03-SCORING-LOGIC.md
Reference: reference-code/ScoringService.java
```

**Deliverables**:
- ScoringService.cs with CalculatePoints method
- 29 comprehensive unit tests
- 100% test pass rate
- Algorithm matches reference implementation

**Critical**: This phase has ZERO tolerance for deviation from GAME-RULES.md

**Validation Checklist**: See `validation/PHASE-03-CHECKLIST.md`

**Next**: Proceed to Phase 4

---

### Phase 4-18: Incremental Feature Development
Each phase follows the same pattern:

1. **Read Phase Document**: `phases/PHASE-{NN}-{NAME}.md`
2. **Delegate to Agent**: Specified in phase document
3. **Apply Error Prevention**: `error-prevention/PHASE-{NN}-PREVENTION.md`
4. **Validate**: `validation/PHASE-{NN}-CHECKLIST.md`
5. **Update Progress**: Mark phase complete in PROGRESS.md
6. **Commit Changes**: Descriptive commit message
7. **Run Tests**: Ensure all pass before proceeding

**Phase List**:
- Phase 4: Tournament & Match Management
- Phase 5: Prediction Submission
- Phase 6: Leaderboard System
- Phase 7: Frontend Foundation
- Phase 8: Authentication UI
- Phase 9: Match Lists
- Phase 10: Prediction Form
- Phase 11: Leaderboard UI
- Phase 12: PWA Features
- Phase 13: football-data.org Integration
- Phase 14: Result Processing
- Phase 15: Competition Features
- Phase 16: Match Organization
- Phase 17: Real-time Updates (SignalR)
- Phase 18: Offline Support

**See**: `PHASE-WORKFLOW.md` for complete phase breakdown

---

### Phase 19: Production Deployment (4-6 hours)
**Objective**: Deploy to free-tier hosting

**Delegate to**: `DEPLOYMENT-AGENT`

**Agent Instructions**:
```
Read: agents/DEPLOYMENT-AGENT.md
Execute: phases/PHASE-19-DEPLOYMENT.md
Reference: deployment/DEPLOYMENT-GUIDE.md
```

**Deliverables**:
- Frontend deployed on Vercel
- Backend deployed on Render
- PostgreSQL on Render
- PWA installable on mobile
- All tests passing in production
- $0/month hosting cost

**Validation Checklist**: See `validation/PHASE-19-CHECKLIST.md`

---

## 🤝 AGENT DELEGATION MODEL

### When to Delegate

You **MUST delegate** to specialized agents for:
- Backend development → `BACKEND-AGENT`
- Frontend development → `FRONTEND-AGENT`
- Code review → `CODE-REVIEWER-AGENT`
- Deployment → `DEPLOYMENT-AGENT`
- Testing → `TESTING-AGENT`

### How to Delegate

1. **Read Agent Guide**: `agents/{AGENT-NAME}.md`
2. **Provide Context**:
   ```
   You are the {AGENT-NAME}.
   Your task: {Specific deliverables}
   Phase: {Phase number and name}
   Reference: {Relevant documents}
   Error Prevention: {Known issues to avoid}
   ```
3. **Monitor Progress**: Use TodoWrite tool to track agent's tasks
4. **Validate Output**: Check against validation checklist
5. **Accept or Reject**: If validation fails, agent must fix

### Agent Communication Protocol

**To Backend Agent**:
```markdown
## Task Delegation: Phase {N} - {Name}

**Agent**: BACKEND-AGENT
**Objective**: {Clear objective}

**Instructions**:
1. Read: {Relevant documents}
2. Implement: {Specific features}
3. Test: {Test requirements}
4. Validate: {Validation criteria}

**Deliverables**:
- {Deliverable 1}
- {Deliverable 2}

**Error Prevention**:
- {Known issue 1 and solution}
- {Known issue 2 and solution}

**Acceptance Criteria**:
- [ ] All deliverables complete
- [ ] All tests passing
- [ ] Build succeeds with 0 warnings
- [ ] Code follows SOLID principles

Report back when complete or if blocked.
```

---

## 🛡️ ERROR PREVENTION SYSTEM

### Before Each Phase

1. **Check Prerequisites**:
   - Tool versions correct? (dotnet, node, npm, dotnet-ef)
   - Docker running?
   - Database accessible?
   - Previous phase validated?

2. **Review Error Prevention Document**:
   - Read `error-prevention/PHASE-{NN}-PREVENTION.md`
   - Note known blockers
   - Apply preventive measures

3. **Validate Environment**:
   - Run version checks
   - Test database connection
   - Verify build succeeds

### Known Critical Issues (From .analysis folder)

#### Phase 1 Issues:
❌ **dotnet-ef version mismatch**
- **Problem**: dotnet-ef v10 with .NET 9 project
- **Solution**: `dotnet tool uninstall --global dotnet-ef && dotnet tool install --global dotnet-ef --version 9.0.0`
- **Prevention**: Check version before starting

❌ **EF migration not applying**
- **Problem**: Says "Done" but no tables created
- **Solution**: Use SQL script method: `dotnet ef migrations script --output migration.sql`
- **Prevention**: Always use SQL script method for initial setup

❌ **Package compatibility**
- **Problem**: .NET 10 packages with .NET 9 project
- **Solution**: Use version 9.x packages (see TECH-STACK.md)
- **Prevention**: Verify package versions in .csproj

#### Phase 2 Issues:
❌ **PostgreSQL port conflict**
- **Problem**: Docker PostgreSQL + Windows PostgreSQL both on 5432
- **Solution**: Change Docker port to 5433 in docker-compose.yml
- **Prevention**: Check for existing PostgreSQL before Docker up

#### Phase 19 Issues:
❌ **Angular 19 output directory**
- **Problem**: Vercel looking in wrong directory
- **Solution**: `outputDirectory: "frontend/dist/frontend/browser"`
- **Prevention**: Check Angular version output structure

❌ **SPA routing 404s**
- **Problem**: Routes like /register return 404
- **Solution**: Negative lookahead rewrite: `/((?!.*\\.).*)`
- **Prevention**: Configure rewrites before deployment

❌ **Dockerfile dotnet restore fails - test projects excluded**
- **Problem**: `.dockerignore` excludes `**/tests/` but `dotnet restore` targets full `.sln` which references test projects
- **Solution**: Target API `.csproj` directly: `dotnet restore src/FootballPrediction.Api/FootballPrediction.Api.csproj`
- **Prevention**: Always check `.dockerignore` exclusions match Dockerfile COPY/RESTORE targets

**See**: `ERROR-PREVENTION.md` for complete list

---

## ✅ VALIDATION SYSTEM

### Phase Completion Criteria

A phase is **COMPLETE** only when ALL of these are true:

- [ ] All deliverables implemented
- [ ] All tests passing (unit + integration)
- [ ] Build succeeds with 0 warnings, 0 errors
- [ ] Code follows SOLID, DRY, KISS principles
- [ ] PROGRESS.md updated
- [ ] TEST-RESULTS.md updated
- [ ] Changes committed with descriptive message
- [ ] Validation checklist passed (see `validation/PHASE-{NN}-CHECKLIST.md`)

### Quality Gates

**Never proceed to next phase if**:
- ❌ Any tests failing
- ❌ Build has errors or warnings
- ❌ Validation checklist incomplete
- ❌ Code quality issues present
- ❌ Documentation not updated

**Orchestrator Rule**: You are the guardian of quality. Do not compromise.

---

## 📊 PROGRESS TRACKING

### Update After Every Phase

**PROGRESS.md**:
```markdown
### Phase {N}: {Name} ✅
**Status:** Completed
**Date:** {Date}
**Duration:** {Hours}

**Deliverables:**
- [x] Feature 1
- [x] Feature 2

**Notes:**
- {Any issues encountered}
- {Solutions applied}

**Tests:** {Passing count}/{Total count}
**Build:** ✅ 0 warnings, 0 errors
```

**TEST-RESULTS.md**:
```markdown
## Phase {N}: {Name}

**Date:** {Date}
**Test Framework:** {xUnit/Jasmine/Cypress}

### Test Results
- **Total Tests:** {count}
- **Passed:** {count}
- **Failed:** 0
- **Coverage:** {percentage}%

### Test Categories
- Unit Tests: {count} passing
- Integration Tests: {count} passing
- E2E Tests: {count} passing
```

---

## 🎓 LEARNING SYSTEM

### After Complex Phases (3+ hours or 2+ blockers)

Create session analysis: `.analysis/YYYY-MM-DD-phase-{N}-{name}.md`

**Template**: See `templates/SESSION-ANALYSIS-template.md`

**Required Contents**:
- What was accomplished
- Issues encountered (with root causes)
- Solutions applied (with exact commands)
- Time spent on blockers
- Lessons learned
- Prevention strategies

**Purpose**: Future builds avoid these same issues

---

## 🔄 ITERATION & IMPROVEMENT

### After Complete Build (All Phases Done)

1. **Review All Session Analyses**
2. **Extract Patterns**:
   - Common errors across phases
   - Time-consuming tasks
   - Unclear documentation
3. **Update Specification**:
   - Improve phase documents
   - Add more error prevention
   - Clarify instructions
4. **Update Agent Guides**:
   - Add troubleshooting sections
   - Document new patterns
5. **Version 2.1 Ready**

---

## 🚨 EMERGENCY PROTOCOLS

### If Completely Blocked

1. **Document the Blocker**:
   - Exact error message
   - Steps to reproduce
   - What you've tried
   - Environment details

2. **Check Reference**:
   - Does `.analysis/` folder have solution?
   - Does `ERROR-PREVENTION.md` cover this?
   - Is there a similar issue in reference project?

3. **Ask User**:
   ```
   I am blocked on Phase {N}: {Name}

   Issue: {Clear description}
   Error: {Exact error}
   Tried: {Solutions attempted}

   Need: {What would unblock you}
   ```

4. **Never Proceed Broken**: Do not continue to next phase with failing tests or broken builds

---

## 📁 FOLDER STRUCTURE (This .spec_v_2 Directory)

```
.spec_v_2/
├── START-HERE.md                      # 👈 YOU ARE HERE
├── REFERENCE.md                       # Reference application overview
├── GAME-RULES.md                      # Scoring algorithm (CRITICAL)
├── REQUIREMENTS.md                    # Functional requirements
├── TECH-STACK.md                      # Technology stack
├── ARCHITECTURE.md                    # System architecture
├── PROJECT-STRUCTURE.md               # Folder organization
├── PHASE-WORKFLOW.md                  # Complete phase breakdown
├── AGENT-DELEGATION.md                # Delegation guidelines
├── ERROR-PREVENTION.md                # All known issues & solutions
├── VALIDATION-CHECKLIST.md            # Master validation guide
│
├── agents/                            # Specialized agent guides
│   ├── ORCHESTRATOR-AGENT.md          # You (master coordinator)
│   ├── BACKEND-AGENT.md               # .NET development
│   ├── FRONTEND-AGENT.md              # Angular development
│   ├── CODE-REVIEWER-AGENT.md         # Code quality
│   ├── DEPLOYMENT-AGENT.md            # Production deployment
│   └── TESTING-AGENT.md               # Test execution
│
├── phases/                            # Step-by-step phase guides
│   ├── PHASE-00-SETUP.md
│   ├── PHASE-01-BACKEND-FOUNDATION.md
│   ├── PHASE-02-AUTHENTICATION.md
│   ├── PHASE-03-SCORING-LOGIC.md
│   ├── ... (all 26 phases)
│   └── PHASE-19-DEPLOYMENT.md
│
├── error-prevention/                  # Phase-specific error prevention
│   ├── PHASE-01-PREVENTION.md
│   ├── PHASE-02-PREVENTION.md
│   └── ... (critical phases)
│
├── validation/                        # Phase validation checklists
│   ├── PHASE-01-CHECKLIST.md
│   ├── PHASE-02-CHECKLIST.md
│   └── ... (all phases)
│
├── templates/                         # Document templates
│   ├── PROGRESS-template.md
│   ├── TEST-RESULTS-template.md
│   ├── SESSION-ANALYSIS-template.md
│   └── COMMIT-MESSAGE-template.md
│
├── reference-code/                    # Reference implementation samples
│   ├── ScoringService.java            # Correct scoring algorithm
│   ├── Match.java                     # Entity example
│   └── ... (key reference files)
│
└── deployment/                        # Deployment guides
    ├── DEPLOYMENT-GUIDE.md
    ├── VERCEL-SETUP.md
    ├── RENDER-SETUP.md
    └── DOCKER-CONFIGURATION.md
```

---

## 🎯 SUCCESS CRITERIA

### You Have Succeeded When:

✅ **All 19 phases complete** (Phases 0-18 + Deployment)
✅ **Application running in production**
✅ **All tests passing** (100+ backend + 50+ frontend)
✅ **PWA installable on mobile**
✅ **Scoring algorithm matches reference exactly**
✅ **Zero hosting costs ($0/month)**
✅ **Documentation complete** (PROGRESS.md, TEST-RESULTS.md, session analyses)
✅ **Clean git history** (clear commit messages)

### Final Validation

Run `validation/FINAL-CHECKLIST.md` before declaring success.

---

## 💡 TIPS FOR SUCCESS

### DO:
✅ Read documents completely before acting
✅ Follow phases sequentially (no skipping)
✅ Use TodoWrite tool religiously
✅ Commit frequently with clear messages
✅ Update documentation after each phase
✅ Delegate to specialized agents
✅ Apply error prevention measures
✅ Validate before proceeding
✅ Run all tests before committing
✅ Check reference when unsure

### DON'T:
❌ Skip reading critical documents
❌ Proceed with failing tests
❌ Ignore warnings or errors
❌ Commit without testing
❌ Copy code without understanding
❌ Deviate from GAME-RULES.md
❌ Skip validation checklists
❌ Guess when you can reference
❌ Continue when blocked (ask user)
❌ Forget to update documentation

---

## 🎬 READY TO START?

### Your First Action

1. **Read this document completely** ✅ (you're doing it now)
2. **Read REFERENCE.md** - Understand what you're building
3. **Read GAME-RULES.md** - CRITICAL scoring algorithm
4. **Read PHASE-WORKFLOW.md** - Your roadmap
5. **Read AGENT-DELEGATION.md** - How to delegate
6. **Start Phase 0** - Project setup

### Template Message to User

```markdown
## Orchestrator Agent - Ready to Build

I have read and understood:
- ✅ START-HERE.md (orchestrator role)
- ✅ REFERENCE.md (application overview)
- ✅ GAME-RULES.md (scoring algorithm)
- ✅ PHASE-WORKFLOW.md (build plan)
- ✅ AGENT-DELEGATION.md (delegation model)

**Plan**: Build Football Prediction PWA from scratch following 19 phases
**Approach**: Sequential phase execution with agent delegation
**Quality**: Zero tolerance for failing tests or broken builds
**Timeline**: Estimated 40-50 hours over 10-15 days

**Next Action**: Begin Phase 0 - Project Setup

Proceed? (yes to start Phase 0)
```

---

## 📞 NEED HELP?

- **Unclear Phase?** → Read `phases/PHASE-{NN}-{NAME}.md`
- **Error Encountered?** → Check `ERROR-PREVENTION.md`
- **Agent Question?** → Read `agents/{AGENT-NAME}.md`
- **Validation Issue?** → Check `validation/PHASE-{NN}-CHECKLIST.md`
- **Still Stuck?** → Check `.analysis/` folder for similar issues
- **Can't Proceed?** → Ask user with details (blocker protocol above)

---

**Remember**: You are the guardian of quality. The user trusts you to build a production-ready application autonomously. You have all the knowledge from the previous build in this specification system.

**You will succeed.** 🚀

---

**Version**: 2.0
**Created**: 2026-03-05
**Status**: Master Orchestration Document
**Next**: Proceed to REFERENCE.md to understand the application
