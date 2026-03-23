# Task (Ticket) Lifecycle

## Ticket States

```
BACKLOG → PLANNING → IN_PROGRESS → IN_REVIEW → TESTING → DONE
                         ↑              │          │
                         └──────────────┘          │
                         (changes requested)       │
                         ↑                         │
                         └─────────────────────────┘
                         (bug found)
```

## State Definitions

### BACKLOG
- Ticket created by Orchestrator/Analyst/Architect
- Has: title, description, acceptance criteria, test plan, priority, assigned agent type
- Waiting to be picked up

### PLANNING
- Agent reads ticket and plans approach
- May ask questions to Analyst/Architect/Researcher
- Updates ticket with implementation notes

### IN_PROGRESS
- QA writes failing tests (if test-first applies)
- Developer implements the feature
- Developer verifies local build and tests pass

### IN_REVIEW
- Code submitted to Code Reviewer
- Reviewer checks against review checklist
- Outcome: APPROVED or CHANGES_REQUESTED
- If changes requested → back to IN_PROGRESS

### TESTING
- QA Engineer verifies acceptance criteria
- Runs all tests (unit + integration)
- If bug found → back to IN_PROGRESS with bug report
- If all criteria met → APPROVED

### DONE
- Code approved by reviewer and QA
- Lead Developer pushes to git
- Ticket closed with summary

## Ticket File Format

Each ticket is a file in `backlog/TICKET-XXX.md`:

```markdown
# TICKET-XXX: [Title]

**Status**: BACKLOG | PLANNING | IN_PROGRESS | IN_REVIEW | TESTING | DONE
**Priority**: P0 | P1 | P2
**Assigned to**: [Agent type]
**Depends on**: TICKET-YYY, TICKET-ZZZ
**User Story**: US-XXX

## Description
[What needs to be built]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Test Plan
- [ ] Test 1
- [ ] Test 2

## Implementation Notes
[Added by developer during PLANNING/IN_PROGRESS]

## Review Notes
[Added by Code Reviewer]

## QA Notes
[Added by QA Engineer]

## Git Info
Commit: [hash]
Branch: [branch]
Pushed by: Lead Developer
```

## Priority Rules
- **P0** tickets must be completed before P1 tickets start
- **P1** tickets should be completed before P2 tickets
- Dependencies must be respected regardless of priority
- Critical path tickets always take precedence
