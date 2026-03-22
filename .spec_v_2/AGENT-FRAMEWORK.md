# Agent Framework for Football Prediction PWA

**Date**: 2026-03-22
**Based on**: User's Codex agent-control structure (C:\Users\erikv\Downloads\RUN-THIS-FIRST)
**Adapted for**: Claude Code CLI with Agent tool

---

## ORCHESTRATOR ENTRY POINT

The orchestrator (main Claude session) coordinates specialist agents for the rebuild.

### Primary Sources to Read First
1. `.spec_v_2/GAP-ANALYSIS.md` — What's missing
2. `.spec_v_2/V1-FEATURE-INVENTORY.md` — Complete v1 reference
3. `.spec_v_2/GAME-RULES.md` — Scoring algorithm (MUST match exactly)
4. `.spec_v_2/ERROR-PREVENTION.md` — Known issues and solutions
5. UI screenshots at `C:\Users\erikv\OneDrive\Desktop\football-prediction-game-ui\`

### v1 Reference Command
```bash
git show version_1_06_02_2026:<filepath>
```

---

## SPECIALIST AGENTS (Claude Code Agent Tool)

### 1. ANALYST Agent
**When to use**: Before implementing any feature group
**Purpose**: Compare v1 implementation with v2 gaps, produce exact requirements
**Prompt template**:
```
You are the ANALYST agent. Compare the v1 implementation (branch version_1_06_02_2026)
with v2 (current code) for [FEATURE AREA].

Read v1 files using: git show version_1_06_02_2026:<path>
Read v2 files directly.

Produce:
1. Exact list of missing backend endpoints
2. Exact list of missing frontend components
3. Exact list of missing services
4. Entity/model differences
5. Implementation priority order
```

### 2. ARCHITECT Agent
**When to use**: Before implementing cross-cutting features
**Purpose**: Design how feature fits into existing v2 architecture
**Prompt template**:
```
You are the ARCHITECT agent. Design the implementation for [FEATURE].

Read current v2 code structure. Ensure:
- SOLID principles
- Clean Architecture layers (Domain → Application → Infrastructure → API)
- No breaking changes to existing working features
- Reuse existing patterns from v2 codebase

Produce:
1. Files to create/modify
2. Entity changes (if any, needs migration)
3. Service interfaces
4. Controller endpoints
5. Dependency injection registrations
```

### 3. BACKEND Agent
**When to use**: Implementing .NET backend features
**Purpose**: Write backend code following existing patterns
**Prompt template**:
```
You are the BACKEND agent. Implement [FEATURE] in the .NET 9 backend.

Reference v1: git show version_1_06_02_2026:<path>
Follow existing v2 patterns for:
- Entity definitions (Domain project)
- Repository interfaces (Application project)
- Repository implementations (Infrastructure project)
- Service interfaces + implementations
- Controller endpoints (API project)
- DI registration in Program.cs

MUST: Build with 0 warnings, 0 errors
MUST: Follow SOLID, DRY, KISS
```

### 4. FRONTEND Agent
**When to use**: Implementing Angular frontend features
**Purpose**: Write Angular components, services, routes
**Prompt template**:
```
You are the FRONTEND agent. Implement [FEATURE] in the Angular 19 frontend.

Reference v1: git show version_1_06_02_2026:<path>
Reference UI screenshots: C:\Users\erikv\OneDrive\Desktop\football-prediction-game-ui\

Follow existing v2 patterns for:
- Standalone components
- Services with signals
- Tailwind CSS styling
- Route configuration

Match the UI design from screenshots.
MUST: Build with 0 errors
```

### 5. BACKEND REVIEWER Agent
**When to use**: After backend implementation
**Purpose**: Review for bugs, SOLID violations, missing tests
**Use**: `subagent_type: "Architecture Reviewer"` or `"Code Quality Reviewer"`

### 6. FRONTEND REVIEWER Agent
**When to use**: After frontend implementation
**Purpose**: Review for routing issues, component quality, UX
**Use**: `subagent_type: "Code Quality Reviewer"`

### 7. QA Agent
**When to use**: After each feature is implemented
**Purpose**: Verify feature works end-to-end
**Prompt template**:
```
You are the QA agent. Verify [FEATURE] works correctly.

1. Check backend endpoint responds correctly (curl tests)
2. Check frontend component renders
3. Check data flow end-to-end
4. Check error cases
5. Report: PASS/FAIL with details
```

### 8. UI DESIGN Agent
**When to use**: When implementing UI components
**Purpose**: Interpret screenshots and produce implementation specs
**Prompt template**:
```
You are the UI DESIGN agent. Read the screenshot at [PATH] and produce:

1. Layout structure (flexbox/grid)
2. Component hierarchy
3. Color values (from screenshot)
4. Spacing and typography
5. Interactive states (hover, active, disabled)
6. Responsive considerations
7. Map to Tailwind CSS classes
```

---

## WORKFLOW

### Phase 1: Analysis (per feature group)
1. ANALYST agent compares v1 vs v2
2. Produces requirements document
3. Orchestrator reviews and prioritizes

### Phase 2: Design (per feature)
1. ARCHITECT agent designs implementation
2. UI DESIGN agent interprets screenshots (if UI involved)
3. Orchestrator approves design

### Phase 3: Implementation
1. BACKEND agent implements API changes
2. FRONTEND agent implements UI changes
3. Both reference v1 code and screenshots

### Phase 4: Review
1. BACKEND REVIEWER checks backend changes
2. FRONTEND REVIEWER checks frontend changes
3. Defects routed back to implementing agent

### Phase 5: Verification
1. QA agent runs end-to-end checks
2. Build verification (0 errors, 0 warnings)
3. Orchestrator marks feature complete

### Phase 6: Documentation
1. Update GAP-ANALYSIS.md (mark feature as done)
2. Update ERROR-PREVENTION.md (if new issues found)
3. Update PROGRESS.md
4. Commit with descriptive message

---

## COMMUNICATION RULES

### Agent → Orchestrator
- Report completion with evidence (build output, test results)
- Report blockers immediately with exact error
- Never proceed when blocked — ask for help

### Orchestrator → Agent
- Provide exact file paths and feature scope
- Reference v1 code paths
- Reference UI screenshots
- Provide error prevention notes

### Agent → Agent (via Orchestrator)
- Frontend blocked on missing API → Orchestrator routes to Backend agent
- Backend needs entity design → Orchestrator routes to Architect agent
- Reviewer finds defect → Orchestrator routes back to implementing agent

---

## EXECUTION PRIORITY (from GAP-ANALYSIS.md)

### P0 — Core UX (Do First)
1. Navigation system (header + bottom nav)
2. Competition selector + matchday filter
3. Match status tabs (Upcoming/Live/Completed)
4. Score input component (visual +/- buttons)
5. Status badges
6. Points info display

### P1 — Core Features
7. Competition entity + endpoints
8. Match filtering by competition/matchday
9. Admin guard + admin routes
10. Admin dashboard + CRUD UI
11. Result entry UI
12. User preferences (competition selection)

### P2 — Important
13. Weekly leaderboard
14. Competition-specific leaderboard
15. User stats view
16. Countdown timer
17. Home/landing page

### P3 — Enhancement
18. Weekly bonus system
19. Stage multiplier
20. IndexedDB offline caching
21. SignalR client integration
22. Install prompt component

---

## SPEC UPDATE RULES

After each feature is implemented:
1. Mark it complete in GAP-ANALYSIS.md
2. If new errors found → add to ERROR-PREVENTION.md
3. If architecture decisions made → document in specs
4. The goal: specs should be good enough that a fresh agent can rebuild from scratch with zero human testing
