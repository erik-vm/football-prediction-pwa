# Git Commit Message Templates

**Version**: 2.0
**Purpose**: Consistent, descriptive commit messages

---

## 📋 STANDARD FORMAT

```
{type}({scope}): {short description}

{Long description - optional}

{List of changes}
- Change 1
- Change 2

Tests: {X} passing
Build: ✅ 0 warnings, 0 errors
```

---

## 🏷️ COMMIT TYPES

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code refactoring
- **docs**: Documentation
- **test**: Tests
- **chore**: Maintenance

---

## 📦 SCOPES

**Backend**: api, auth, scoring, db, service
**Frontend**: ui, auth, matches, predictions, leaderboard, pwa
**General**: config, deps, test, docs

---

## 📝 EXAMPLES

### Phase Completion
```
feat: Phase {N} - {Name} complete

Implemented {summary}.

Deliverables:
- {Item 1}
- {Item 2}

Tests: {X} passing
Build: 0 warnings, 0 errors

Next: Phase {N+1}
```

### Feature
```
feat(scope): add {feature}

Implemented {description}.

Changes:
- {Change 1}
- {Change 2}

Tests: +{X} tests, all passing
```

### Bug Fix
```
fix(scope): resolve {issue}

Fixed {problem}.

Root Cause: {cause}
Solution: {solution}

Tests: Added regression test
```

---

## 🤖 AGENT TEMPLATE

```
{type}({scope}): {description}

Phase: {N}
Duration: {X}h

Deliverables:
- {Item 1}
- {Item 2}

Tests: {X} passing
Build: ✅ Success

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## ✅ PRE-COMMIT CHECKLIST

- [ ] Code builds
- [ ] Tests pass
- [ ] Message descriptive
- [ ] Follows template
- [ ] Documentation updated

---

**Use for**: All project commits
