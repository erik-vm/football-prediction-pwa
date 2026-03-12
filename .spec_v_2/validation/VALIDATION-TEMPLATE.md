# Phase {N}: {Name} - Validation Checklist

**Phase**: {N}
**Date**: {TODAY}
**Validator**: {AGENT_NAME}

---

## ✅ PRE-VALIDATION

Before starting validation, ensure:
- [ ] Phase {N-1} validation passed
- [ ] All commits pushed to git
- [ ] Clean working directory (`git status`)

---

## 📋 DELIVERABLES CHECKLIST

### Core Deliverables
- [ ] {Deliverable 1 complete and tested}
- [ ] {Deliverable 2 complete and tested}
- [ ] {Deliverable 3 complete and tested}
- [ ] {Add all deliverables from phase document}

---

## 🏗️ BUILD VALIDATION

### Solution Build
```bash
# Navigate to appropriate directory
cd {backend or frontend}

# Clean build
{dotnet clean / npm run clean}

# Build
{dotnet build / npm run build}

# Check output
# Expected: 0 warnings, 0 errors
```

- [ ] Build succeeds
- [ ] 0 warnings
- [ ] 0 errors
- [ ] Build output directory exists

---

## 🧪 TEST VALIDATION

### Unit Tests
```bash
# Run unit tests
{dotnet test / npm test}

# Check results
```

- [ ] All unit tests pass
- [ ] No skipped tests
- [ ] Coverage meets threshold ({X}%)
- [ ] Test output clean (no warnings)

### Integration Tests (if applicable)
```bash
# Run integration tests
{commands}
```

- [ ] All integration tests pass
- [ ] Database state clean after tests
- [ ] No test data left in database

---

## 🔧 FUNCTIONAL VALIDATION

### API Endpoints (if backend phase)
For each endpoint created in this phase:

**Endpoint 1**: {METHOD} {PATH}
```bash
# Test command
curl -X {METHOD} http://localhost:5000{PATH} -H "Authorization: Bearer {TOKEN}" -H "Content-Type: application/json" -d '{JSON}'

# Expected response
{JSON or status code}
```
- [ ] Returns correct status code
- [ ] Response format correct
- [ ] Validation works (test invalid input)
- [ ] Authorization enforced (if protected)

### UI Components (if frontend phase)
For each component created:

**Component 1**: {ComponentName}
- [ ] Renders without errors
- [ ] All UI elements display correctly
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Loading states show
- [ ] Error states handled

---

## 💾 DATABASE VALIDATION (if applicable)

### Schema Changes
```bash
# Check tables
{docker exec ... psql ... -c '\dt'}

# Check specific table structure
{docker exec ... psql ... -c '\d "TableName"'}
```

- [ ] New tables created
- [ ] Columns correct (names, types, nullable)
- [ ] Indexes created
- [ ] Foreign keys configured
- [ ] Migration history updated

### Data Integrity
```bash
# Check for orphaned records
{SQL query}

# Check constraints
{SQL query}
```

- [ ] No orphaned records
- [ ] Constraints enforced
- [ ] Test data present (if expected)

---

## 🔐 SECURITY VALIDATION (if applicable)

### Authentication
- [ ] Protected endpoints require valid JWT
- [ ] Invalid/expired tokens rejected
- [ ] Unauthorized access returns 401
- [ ] Forbidden access returns 403

### Authorization
- [ ] User roles enforced
- [ ] Admin endpoints require admin role
- [ ] Users can only access their own data

### Input Validation
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (sanitization)
- [ ] Input validation works (test invalid inputs)
- [ ] Error messages don't leak sensitive info

---

## 📱 PWA VALIDATION (if Phase 12+)

### Service Worker
```bash
# Check registration in browser DevTools
# Application → Service Workers
```

- [ ] Service worker registered
- [ ] Service worker activated
- [ ] Cache populated (check Cache Storage)
- [ ] Offline mode works

### Manifest
```bash
# Check manifest in browser DevTools
# Application → Manifest
```

- [ ] Manifest loaded
- [ ] Icons display
- [ ] Theme colors correct
- [ ] Install prompt appears (mobile)

---

## 🔄 INTEGRATION VALIDATION

### API Integration (frontend → backend)
- [ ] API calls succeed
- [ ] Responses handled correctly
- [ ] Errors handled gracefully
- [ ] Loading states display
- [ ] CORS configured correctly

### Database Integration (backend → database)
- [ ] Queries execute successfully
- [ ] Transactions commit/rollback correctly
- [ ] Connection pooling works
- [ ] No connection leaks

---

## 📊 PERFORMANCE VALIDATION

### Backend Performance (if applicable)
```bash
# Load test (simple)
ab -n 100 -c 10 http://localhost:5000{ENDPOINT}
```

- [ ] Response time < {threshold}ms
- [ ] No memory leaks
- [ ] No performance degradation over time

### Frontend Performance (if applicable)
```bash
# Lighthouse audit
npm run lighthouse
```

- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Bundle size reasonable

---

## 📝 DOCUMENTATION VALIDATION

### Code Documentation
- [ ] Public methods have XML comments (C#)
- [ ] Complex logic has inline comments
- [ ] README updated (if needed)
- [ ] API documentation generated (Swagger)

### Tracking Documents
- [ ] PROGRESS.md updated (phase marked complete)
- [ ] TEST-RESULTS.md updated
- [ ] Session analysis created (if complex phase)
- [ ] Git commit messages descriptive

---

## 🎯 COMPLETION CRITERIA

Phase {N} is **COMPLETE** when ALL of the following are true:

- [ ] All deliverables complete
- [ ] Build succeeds (0 warnings, 0 errors)
- [ ] All tests pass ({X} tests total)
- [ ] Functional validation passed
- [ ] Security validation passed (if applicable)
- [ ] Database validation passed (if applicable)
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Code committed with clear message
- [ ] Clean git status
- [ ] Ready to proceed to Phase {N+1}

---

## ⚠️ FAILURE ACTIONS

If ANY validation fails:

1. **Document the failure**:
   - What failed?
   - What was expected?
   - What was actual result?

2. **Do NOT proceed to next phase**:
   - Fix the issue first
   - Re-run validation
   - Only proceed when ALL checks pass

3. **Update ERROR-PREVENTION.md**:
   - Add new error if not documented
   - Include error message, cause, solution

4. **Ask for help if stuck**:
   - Provide specific details
   - Include error messages
   - List what you've tried

---

## 📋 SIGN-OFF

**Validator**: {AGENT_NAME}
**Date**: {TIMESTAMP}
**Status**: ✅ PASSED / ❌ FAILED
**Notes**: {Any notes about validation}

**If PASSED**: Proceed to Phase {N+1}
**If FAILED**: Fix issues and re-validate

---

**Version**: 2.0
**Created**: 2026-03-05
**Template**: Use this for all phase validations
