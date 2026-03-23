# Git Workflow

## Branch Strategy
- Main branch: `main` (production)
- Development branch: `version_3_[start_date]` (e.g., `version_3_25_03_2026`)
- All development happens on the version branch
- Merge to main only after full QA verification

## Commit Convention

```
<type>(<scope>): <description>

<body>

Ticket: TICKET-XXX
Agent: <agent-role>
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
| Type | When |
|------|------|
| feat | New feature |
| fix | Bug fix |
| test | Adding/updating tests |
| docs | Documentation only |
| chore | Build, config, tooling |
| refactor | Code change without behavior change |

### Scopes
| Scope | Area |
|-------|------|
| auth | Authentication (register, login, JWT) |
| matches | Match management |
| predictions | Prediction CRUD and scoring |
| leaderboard | Leaderboard calculation and display |
| scoring | Scoring algorithm |
| sync | Football data sync |
| deploy | Deployment configuration |
| ui | UI components, styling |
| db | Database, migrations |
| setup | Project setup |

### Examples
```
feat(auth): implement JWT authentication with refresh tokens

Add AuthService with register, login, and token refresh.
BCrypt password hashing with cost factor 12.
Access token expires in 60 minutes, refresh token in 7 days.

Ticket: TICKET-006
Agent: Backend-Developer

feat(ui): create match list with tabs and filters

Three tabs (upcoming/live/completed) with competition
selector and matchday filter. Auto-selects nearest matchday.

Ticket: TICKET-016
Agent: Frontend-Developer
```

## Push Rules

1. **Only Lead Developer pushes** - no other agent touches git
2. **One ticket per commit** - atomic changes
3. **Never force push** - preserve history
4. **Never push failing code** - all tests must pass
5. **No secrets in code** - API keys in environment variables only
6. **Sequential pushes** - wait for previous push to complete

## Push Checklist (Lead Developer)

Before every push:
- [ ] Code reviewed and approved by Code Reviewer
- [ ] QA verified acceptance criteria
- [ ] `dotnet build` succeeds (0 errors, 0 warnings)
- [ ] `dotnet test` all pass
- [ ] `ng build` succeeds (if frontend changed)
- [ ] Commit message follows convention
- [ ] No merge conflicts
- [ ] No sensitive data in diff

## Merge Conflict Resolution

1. Lead Developer identifies conflict
2. Consults relevant Developer(s)
3. Resolves conflict
4. Rebuilds and retests
5. Pushes resolved code
