# TICKET-015: Auth UI (Login + Register)

**Status**: BACKLOG
**Priority**: P0
**Assigned to**: Frontend Developer
**Depends on**: TICKET-014
**User Story**: US-001, US-002, US-004
**Complexity**: M
**Critical path**: YES

## Description
Login and Register pages matching UI mockups. AuthService integration with signals. Logout functionality.

## Acceptance Criteria
- [ ] Login page at /login: email + password form
- [ ] Login validation: email format, password required (min 8)
- [ ] Login success: store tokens in localStorage, navigate to /matches
- [ ] Login error: display error message
- [ ] Register page at /register: username, email, password fields
- [ ] Register validation: username 3-50 chars, valid email, password 8+ with letter+digit
- [ ] Register success: auto-login, navigate to /matches
- [ ] Register error: display error message (duplicate email/username)
- [ ] Register button on login page navigates to /register
- [ ] Back arrow on register page navigates to /login
- [ ] Logout: clears storage, redirects to /login
- [ ] AuthService signals: isAuthenticated, currentUser updated correctly
- [ ] UI matches login_view.png and register_view.png mockups
- [ ] Orange buttons, rounded inputs, "Football Prediction Game" title

## Test Plan
- [ ] Unit: Login form validates required fields
- [ ] Unit: Register form validates all constraints
- [ ] Unit: AuthService stores tokens on successful login
- [ ] Unit: Logout clears storage and sets isAuthenticated=false

## Files to Create/Modify
- [ ] `frontend/src/app/features/auth/login/login.component.ts`
- [ ] `frontend/src/app/features/auth/login/login.component.html`
- [ ] `frontend/src/app/features/auth/register/register.component.ts`
- [ ] `frontend/src/app/features/auth/register/register.component.html`
