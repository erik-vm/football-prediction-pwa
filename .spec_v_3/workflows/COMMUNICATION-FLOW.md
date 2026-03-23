# Agent Communication Flow

## Core Principle
Agents communicate through structured requests and responses. All important decisions are logged in ticket artifacts.

## Communication Hierarchy

```
                    ┌──────────────┐
                    │  HUMAN       │ (only for deployment setup + UI mockups)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ ORCHESTRATOR │ (coordinates everything)
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
   │   ANALYST   │  │  ARCHITECT │  │  RESEARCHER │
   │ (what)      │  │  (how)     │  │  (find info)│
   └──────┬──────┘  └─────┬──────┘  └─────────────┘
          │                │
          │     ┌──────────┼──────────────┐
          │     │          │              │
   ┌──────▼─────▼┐  ┌─────▼────┐  ┌─────▼─────────┐
   │ BACKEND DEV │  │FRONT DEV │  │ DB SPECIALIST  │
   │             │  │          │  │                │
   └──────┬──────┘  └─────┬────┘  └────────────────┘
          │                │
          │     ┌──────────┘
          │     │
   ┌──────▼─────▼─────────┐
   │ SECURITY ENGINEER     │ (reviews auth/security aspects)
   └──────┬────────────────┘
          │
   ┌──────▼─────────┐
   │ CODE REVIEWER   │ (reviews quality/design)
   └──────┬──────────┘
          │
   ┌──────▼─────────┐
   │ QA ENGINEER     │
   └──────┬──────────┘
          │
   ┌──────▼─────────┐
   │ LEAD DEVELOPER  │ (technical lead + git push)
   └─────────────────┘
```

## Question Routing

| Agent has question about... | Ask this agent |
|----------------------------|----------------|
| What should the feature do? | Analyst |
| How should it be structured? | Architect |
| External API details? | Researcher |
| Database schema? | DB Specialist / Architect |
| Visual design? | UI Designer |
| Is this code correct? | Code Reviewer |
| Is this secure? Auth/CORS/secrets? | Security Engineer |
| Does this meet acceptance criteria? | QA Engineer |
| Can I push this code? | Lead Developer (via Orchestrator) |
| Is this in scope? | Analyst → Orchestrator |
| Deployment config? | DevOps Engineer |

## Communication Loops

### 1. Clarification Loop
```
Agent detects ambiguity
  → Writes question with context
  → Routes to appropriate specialist
  → Specialist responds with answer
  → If answer changes scope → Orchestrator updates plan
  → Agent continues work
```

### 2. Development Loop
```
QA writes failing tests (from acceptance criteria)
  → Developer receives tests + ticket
  → Developer implements until tests pass
  → Developer requests Code Review
  → Code Reviewer reviews
  → If APPROVED → Lead Developer pushes
  → If CHANGES REQUESTED → Developer fixes → re-review
  → QA does final verification
  → Ticket marked DONE
```

### 3. Bug Fix Loop
```
QA finds bug
  → Creates bug report with reproduction steps
  → Orchestrator assigns to relevant Developer
  → Developer fixes and documents
  → Developer requests re-review
  → QA verifies fix
  → If fixed → Ticket updated
  → If not fixed → back to Developer
```

### 4. Research Loop
```
Any agent needs external information
  → Sends RESEARCH REQUEST to Researcher
  → Researcher investigates (web search, docs)
  → Returns RESEARCH FINDINGS
  → Requesting agent evaluates
  → If sufficient → continues work
  → If insufficient → refines request → Researcher tries again
  → Max 3 iterations → escalate to Orchestrator
```

### 5. Architecture Decision Loop
```
Developer unsure about design
  → Asks Architect with context + options
  → Architect decides (or asks Analyst for requirements)
  → Decision logged in ticket
  → Developer implements per decision
```

### 6. Full-Stack Coordination
```
Backend Developer defines API contract
  → Shares with Frontend Developer
  → Both implement their side
  → If contract needs change:
    → Developer proposes change
    → Architect approves/rejects
    → Both developers update
```

## Inter-Agent Message Format

```
FROM: [Agent Role]
TO: [Agent Role]
TICKET: [TICKET-XXX]
TYPE: question | answer | request | report | approval
SUBJECT: [Brief description]
BODY: [Details]
URGENCY: blocking | important | informational
```

## Rules
1. Never skip the Code Review step
2. Never push without Lead Developer
3. Always log decisions that affect other tickets
4. If blocked for more than 3 attempts, escalate to Orchestrator
5. QA has final say on whether acceptance criteria are met
6. Architect has final say on technical decisions
7. Analyst has final say on business logic
