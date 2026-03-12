# Session Analysis: {SESSION_TITLE}

**Date**: {TODAY}
**Phase(s)**: {PHASE_NUMBER(S)}
**Duration**: {X} hours
**Agent**: {AGENT_NAME}
**Branch**: {BRANCH_NAME}

---

## 📋 SESSION OVERVIEW

**Objective**: {What was the goal of this session?}

**Scope**: {What phases/features were worked on?}

**Outcome**: {✅ Success / ⚠️ Partial / ❌ Failed}

---

## 🎯 TASKS COMPLETED

### Task 1: {Task Name}
**Duration**: {X} minutes
**Status**: ✅ / ❌

**What was done**:
- {Action 1}
- {Action 2}
- {Action 3}

**Files modified/created**:
- `{file_path_1}` ({purpose})
- `{file_path_2}` ({purpose})

**Tests added/modified**: {X} tests

---

### Task 2: {Task Name}
**Duration**: {X} minutes
**Status**: ✅ / ❌

{Repeat structure}

---

## 🐛 ERRORS ENCOUNTERED

### Error 1: {Error Title}
**Phase**: {Phase number}
**Time Lost**: {X} minutes
**Severity**: HIGH / MEDIUM / LOW

#### Exact Error Message
```
{Paste full error message with stack trace}
```

#### Context
**What I was trying to do**:
{Description of the task}

**Command/action that triggered error**:
```bash
{command or code that caused error}
```

**Environment**:
- OS: {Windows/Mac/Linux}
- Tool/framework: {.NET 9 / Angular 19 / etc}
- Version: {version number}

#### Root Cause Analysis
{Detailed explanation of WHY this error occurred}

#### Solution Applied
**What fixed it**:
```bash
{working command or code}
```

**Verification**:
```bash
{command to verify fix worked}
# Expected output: {what should appear}
```

#### Prevention for Next Time
**Before starting {Phase X}**:
```bash
{preventive check command}
```

**Expected result**: {what should show}

**If not correct**: {what to do}

#### Documentation Updates
- [ ] Added to ERROR-PREVENTION.md
- [ ] Updated phase document with warning
- [ ] Added to pre-phase checklist

---

### Error 2: {Error Title}
{Repeat structure}

---

## 💡 SOLUTIONS & WORKAROUNDS

### Solution 1: {Problem Solved}
**Problem**: {Description}

**Attempted approaches**:
1. {Approach 1} → ❌ Failed because {reason}
2. {Approach 2} → ❌ Failed because {reason}
3. {Approach 3} → ✅ Success

**Working solution**:
```bash
{commands or code}
```

**Why it worked**: {Explanation}

**Reusable**: YES / NO

**Added to**: {ERROR-PREVENTION.md / phase doc / agent guide}

---

## 🧪 TESTING SUMMARY

### Tests Run
**Unit Tests**:
- Total: {X}
- Passing: {Y}
- Failing: {Z}
- New in this session: {N}

**Integration Tests**:
- Total: {X}
- Passing: {Y}
- Failing: {Z}

**E2E Tests**:
- Total: {X}
- Passing: {Y}
- Failing: {Z}

### Test Failures
{If any tests failed, document them}

**Test**: {test_name}
**Reason**: {why it failed}
**Fix**: {what was done}
**Status**: ✅ Fixed / 📅 Deferred / ❌ Still failing

---

## 🏗️ BUILD STATUS

### Backend Build
```bash
dotnet build
```
- Status: ✅ Success / ❌ Failed
- Warnings: {X}
- Errors: {Y}
- Build time: {Z} seconds

### Frontend Build
```bash
npm run build
```
- Status: ✅ Success / ❌ Failed
- Warnings: {X}
- Errors: {Y}
- Bundle size: {X} MB
- Build time: {Z} seconds

---

## 📊 DELIVERABLES

### Code Deliverables
- [ ] {Deliverable 1 complete}
- [ ] {Deliverable 2 complete}
- [ ] {Deliverable 3 complete}

### Documentation Updated
- [ ] PROGRESS.md
- [ ] TEST-RESULTS.md
- [ ] ERROR-PREVENTION.md (if errors encountered)
- [ ] README.md (if needed)
- [ ] API documentation (Swagger)

### Git Commits
**Total commits**: {X}

**Commit 1**: {hash}
```
{commit message}
```

**Commit 2**: {hash}
```
{commit message}
```

---

## 📈 METRICS

### Time Breakdown
- **Productive coding**: {X}h ({Y}%)
- **Testing/validation**: {X}h ({Y}%)
- **Debugging/troubleshooting**: {X}h ({Y}%)
- **Documentation**: {X}h ({Y}%)
- **Research/learning**: {X}h ({Y}%)
- **Total session time**: {X}h

### Efficiency Score
**Productive time ratio**: {X}% (target: >70%)
**Debugging overhead**: {X}% (target: <20%)
**Code rewrite percentage**: {X}% (target: <10%)

### Code Metrics
- **Lines of code added**: {X}
- **Lines of code deleted**: {X}
- **Files created**: {X}
- **Files modified**: {X}
- **Test coverage**: {X}%

---

## 🎓 LEARNINGS & INSIGHTS

### Key Learnings
1. **{Learning 1 Title}**
   - What: {Description}
   - Why it matters: {Importance}
   - Applied to: {Where/how used}

2. **{Learning 2 Title}**
   {Repeat structure}

### Best Practices Discovered
1. {Best practice 1}
2. {Best practice 2}
3. {Best practice 3}

### Mistakes to Avoid
1. **{Mistake 1}**: {Why it's bad and how to avoid}
2. **{Mistake 2}**: {Why it's bad and how to avoid}

### Documentation Gaps Found
- {Gap 1}: {What was missing and now added}
- {Gap 2}: {What was missing and now added}

---

## 🚧 BLOCKERS & CHALLENGES

### Active Blockers
{If any blockers are preventing progress}

**Blocker 1**: {Description}
- **Impact**: {High/Medium/Low}
- **Blocking**: {What phase/feature}
- **Status**: {Investigating / Solution found / Escalated}
- **Action needed**: {What needs to happen}
- **Owner**: {Who is responsible}

### Resolved Challenges
**Challenge 1**: {Description}
- **Impact**: {Time lost, features affected}
- **Resolution**: {How it was solved}
- **Time to resolve**: {X} minutes

---

## 📝 TECHNICAL DECISIONS

### Decision 1: {Decision Title}
**Context**: {Why this decision was needed}

**Options considered**:
1. {Option 1} - Pros: {X}, Cons: {Y}
2. {Option 2} - Pros: {X}, Cons: {Y}
3. {Option 3} - Pros: {X}, Cons: {Y}

**Decision**: {Chosen option}

**Rationale**: {Why this was chosen}

**Implications**: {What this affects}

**Reversible**: YES / NO

---

## 🔄 REFACTORING PERFORMED

### Refactor 1: {What was refactored}
**Before**: {Description of old approach}

**After**: {Description of new approach}

**Reason**: {Why it was refactored}

**Benefits**:
- {Benefit 1}
- {Benefit 2}

**Files affected**: {X} files

**Tests updated**: {Y} tests

---

## 🎯 PHASE PROGRESS

### Phase {N}: {Phase Name}
**Status**: ✅ Complete / ⏳ In Progress ({X}%) / 📅 Not Started

**Tasks completed**: {X} / {Y}

**Remaining tasks**:
- [ ] {Task 1}
- [ ] {Task 2}

**Blockers**: {None / List}

**ETA**: {Date or "X hours remaining"}

---

## 🔜 NEXT SESSION PLAN

### Immediate Next Steps
1. {Task 1 for next session}
2. {Task 2 for next session}
3. {Task 3 for next session}

### Prerequisites for Next Session
- [ ] {Prerequisite 1}
- [ ] {Prerequisite 2}

### Estimated Time
**Next session duration**: {X} hours

**Tasks breakdown**:
- {Task 1}: {Y} minutes
- {Task 2}: {Z} minutes

---

## 📎 APPENDIX

### Commands Run
```bash
# Setup commands
{command 1}
{command 2}

# Build commands
{command 3}

# Test commands
{command 4}

# Deployment commands
{command 5}
```

### Configuration Changes
**File**: `{file_path}`
```json
{
  "before": "value",
  "after": "new_value"
}
```

### Useful Resources
- [{Resource 1 title}]({url}) - {why it was useful}
- [{Resource 2 title}]({url}) - {why it was useful}

### Team Communication
**Questions asked**: {X}
**Escalations**: {Y}
**Decisions pending**: {Z}

---

## ✅ SESSION SIGN-OFF

**Session completed**: {YES / NO}

**Phase validation status**: {✅ Passed / ❌ Failed / ⏳ Pending}

**Ready for next phase**: {YES / NO}

**Agent notes**: {Any final notes or observations}

---

## 🤖 AGENT METADATA

**Agent type**: {ORCHESTRATOR / BACKEND / FRONTEND / DEPLOYMENT / TESTING}

**Session ID**: {unique_id}

**Parent session**: {if continuing from previous session}

**Child sessions**: {if spawned other agent sessions}

**Total context tokens used**: {X}

**Tools used**: {List of tools: Bash, Read, Write, Edit, etc.}

---

**Version**: 2.0
**Created**: {TODAY}
**Template**: Use for all complex development sessions
**Storage**: `.analysis/{YYYY-MM-DD}-{session-name}.md`

---

## 📋 COMPLETION CHECKLIST

Before closing this session analysis:

- [ ] All errors documented in ERROR-PREVENTION.md
- [ ] All technical decisions recorded
- [ ] PROGRESS.md updated
- [ ] TEST-RESULTS.md updated
- [ ] Code committed with descriptive messages
- [ ] Next session plan created
- [ ] Blockers escalated (if any)
- [ ] Documentation updated
- [ ] Session analysis file saved in `.analysis/`
