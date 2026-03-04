# Football Prediction PWA - Specifications

This folder contains **all** the specifications, requirements, rules, and guidelines needed to develop the Football Prediction PWA using Angular 19 + .NET 9.

## 📋 Document Index

### Core Specifications

| Document | Purpose | Read When |
|:---------|:--------|:----------|
| **[START-HERE.md](START-HERE.md)** 🚀 | **Agent orchestration entry point - START EVERY SESSION HERE** | **FIRST** - Beginning of EVERY development session |
| **[GAME-RULES.md](GAME-RULES.md)** | Official scoring rules and game logic | **BEFORE** implementing any scoring logic |
| **[REQUIREMENTS.md](REQUIREMENTS.md)** | Complete functional and non-functional requirements | **BEFORE** starting any feature |
| **[TECH-STACK.md](TECH-STACK.md)** | Technology choices, dependencies, versions | **BEFORE** adding dependencies or setting up project |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture, patterns, design decisions | **BEFORE** making architectural changes |
| **[API-SPECIFICATION.md](API-SPECIFICATION.md)** | REST API endpoints, requests, responses | **WHEN** implementing API endpoints or calling them |
| **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** | Folder structure, naming conventions | **WHEN** creating new files or organizing code |
| **[PHASE-COMPLETION-WORKFLOW.md](PHASE-COMPLETION-WORKFLOW.md)** ⚠️ | **Required workflow after EVERY phase** | **AFTER** completing each phase |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** 🔧 | Common issues and solutions | **WHEN** encountering errors or unexpected behavior |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀 | Production deployment guide | **WHEN** deploying to production or troubleshooting deployment issues |

### Agent Guidelines

| Document | Purpose | For |
|:---------|:--------|:----|
| **[agents/ORCHESTRATOR-AGENT.md](agents/ORCHESTRATOR-AGENT.md)** 🎯 | **Master coordinator - Start here every session!** | Session startup & workflow orchestration |
| **[agents/SETUP-AGENT.md](agents/SETUP-AGENT.md)** | Environment setup & prerequisite verification | Setup/onboarding agents |
| **[agents/BACKEND-AGENT.md](agents/BACKEND-AGENT.md)** | .NET backend development guide | Backend AI agents |
| **[agents/FRONTEND-AGENT.md](agents/FRONTEND-AGENT.md)** | Angular frontend development guide | Frontend AI agents |
| **[agents/CODE-REVIEWER-AGENT.md](agents/CODE-REVIEWER-AGENT.md)** | Code review & quality assurance guide | Code review agents |

### Command References

| Document | Purpose | Used By |
|:---------|:--------|:--------|
| **[commands/setup-backend.md](commands/setup-backend.md)** | Backend setup procedure with version checks | Setup Agent, Backend Agent |
| **[commands/database-operations.md](commands/database-operations.md)** | Database migrations, queries, troubleshooting | Backend Agent, Database Admin |

### Coding Standards

| Document | Purpose | Apply When |
|:---------|:--------|:-----------|
| **[rules/security.mdc](rules/security.mdc)** | Security best practices (OWASP) | **ALL** code |
| **[rules/csharp-standards.mdc](rules/csharp-standards.mdc)** | C# coding standards | Writing backend code |
| **[rules/typescript-standards.mdc](rules/typescript-standards.mdc)** | TypeScript coding standards | Writing frontend code |
| **[rules/angular-standards.mdc](rules/angular-standards.mdc)** | Angular-specific patterns | Angular components/services |
| **[rules/dotnet-standards.mdc](rules/dotnet-standards.mdc)** | .NET-specific patterns | ASP.NET Core code |

---

## 🚀 Quick Start for AI Agents

### Backend Agent

1. Read [GAME-RULES.md](GAME-RULES.md) - **CRITICAL**: Scoring logic must match exactly
2. Read [REQUIREMENTS.md](REQUIREMENTS.md) - Understand what to build
3. Read [TECH-STACK.md](TECH-STACK.md) - Know your tools
4. Read [agents/BACKEND-AGENT.md](agents/BACKEND-AGENT.md) - Your working instructions
5. Start coding following [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)

### Frontend Agent

1. Read [REQUIREMENTS.md](REQUIREMENTS.md) - Understand user requirements
2. Read [TECH-STACK.md](TECH-STACK.md) - Know your tools
3. Read [API-SPECIFICATION.md](API-SPECIFICATION.md) - Know how to call backend
4. Read [agents/FRONTEND-AGENT.md](agents/FRONTEND-AGENT.md) - Your working instructions
5. Start coding following [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)

---

## 🎯 Critical Rules

### For ALL Developers

1. **NEVER** implement scoring logic without reading [GAME-RULES.md](GAME-RULES.md)
2. **ALWAYS** follow security guidelines in [rules/security.mdc](rules/security.mdc)
3. **ALWAYS** run pre-commit checks before committing (see agent guides)
4. **ASK** before adding new dependencies or changing architecture
5. **REFERENCE** the Spring Boot + React implementation at `C:\Projects\football-prediciton-game` for correct behavior

### Scoring System (MOST IMPORTANT)

The scoring algorithm MUST match the reference implementation:
- 5 points: Exact score
- 4 points: Correct winner + goal difference
- 3 points: Correct winner only
- 1 point: One team score correct
- 0 points: No match

**DO NOT** implement different logic. The Flutter app has incorrect rules.

---

## 📁 Project Background

### Source of Truth

This project is a **rewrite** of an existing Flutter mobile app that has **incorrect game rules**.

**Correct Implementation**: `C:\Projects\football-prediciton-game` (Spring Boot + React)
**Incorrect Implementation**: `C:\Projects\taltech\icd0011exercises\football_prediction_app` (Flutter - DO NOT USE)

### Why Rewrite?

1. Flutter app has wrong scoring rules
2. Need PWA for better web experience
3. Angular + .NET provides better enterprise support
4. PWA allows offline functionality

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Angular 19 PWA (Client)                  │
│                  TypeScript + Tailwind                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS REST API (JSON)
┌────────────────────┴────────────────────────────────────┐
│              ASP.NET Core 9 Web API                      │
│              Entity Framework Core 9                     │
│              JWT Authentication                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              PostgreSQL 16+ Database                     │
│              EF Core Migrations                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies Summary

### Backend (.NET 9)

```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
<PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="13.0.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
```

### Frontend (Angular 19)

```json
"@angular/core": "^19.0.0",
"@angular/service-worker": "^19.0.0",
"rxjs": "^7.8.0",
"date-fns": "^4.1.0"
```

---

## 🧪 Testing Requirements

### Backend

- **Unit Tests**: > 80% coverage (xUnit + Moq)
- **Integration Tests**: All API endpoints (Testcontainers)
- **Focus**: Scoring logic validation (see GAME-RULES.md test cases)

### Frontend

- **Unit Tests**: > 70% coverage (Jasmine/Karma)
- **E2E Tests**: Critical user flows (Cypress)
- **PWA**: Lighthouse score 100

---

## 🔒 Security Requirements

**MUST IMPLEMENT:**
- JWT authentication (RS256 or HS256)
- Password hashing with BCrypt (work factor 12)
- HTTPS only (TLS 1.3)
- Security headers (CSP, HSTS, X-Frame-Options)
- Input validation on all endpoints
- SQL injection prevention (EF parameterized queries)
- XSS prevention (Angular sanitization)
- CORS configuration (whitelist only)

See [rules/security.mdc](rules/security.mdc) for complete security checklist.

---

## 📊 Success Criteria

### Technical

- ✅ Zero scoring calculation errors
- ✅ 99.5% uptime during tournaments
- ✅ < 2 second page load time (4G mobile)
- ✅ Lighthouse PWA score: 100
- ✅ Zero data loss incidents

### Functional

- ✅ All requirements in [REQUIREMENTS.md](REQUIREMENTS.md) implemented
- ✅ Scoring matches [GAME-RULES.md](GAME-RULES.md) exactly
- ✅ PWA installable on mobile devices
- ✅ Offline prediction submission works

### User Satisfaction

- ✅ > 80% weekly participation rate
- ✅ Positive feedback on ease of use
- ✅ Admin time < 5 minutes per week

---

## 🛠️ Development Workflow

### 1. Setup

```bash
# Backend
cd backend
dotnet restore
dotnet ef database update
dotnet run

# Frontend
cd frontend
npm install
ng serve
```

### 2. Development

- Read relevant spec documents
- Implement feature
- Write tests
- Run local validation

### 3. Pre-Commit

```bash
# Backend
dotnet format && dotnet build && dotnet test

# Frontend
npm run lint && npm run build && npm test -- --watch=false
```

### 4. Commit

```bash
git add .
git commit -m "feat(scope): description"
```

---

## 📝 Naming Conventions

### Git Commits

```
feat(scope): add new feature
fix(scope): fix bug
refactor(scope): improve code
test(scope): add tests
docs(scope): update documentation
```

### Branches

```
feature/description
fix/description
refactor/description
```

### Files

- **Backend**: PascalCase (ScoringService.cs, UserController.cs)
- **Frontend**: kebab-case (prediction-form.component.ts, auth.service.ts)

---

## 🔗 External References

### Inspiration

- Cursor Prompts: `C:\Projects\cursor-prompts` (agent guidelines structure)
- Correct Implementation: `C:\Projects\football-prediciton-game` (Spring Boot + React)

### APIs

- football-data.org API (match imports)
- SendGrid/Mailgun (future email notifications)

### Hosting

**Production (LIVE)**:
- Backend: Render.com (Free Tier) - https://football-prediction-pwa.onrender.com/api
- Frontend: Vercel (Free Tier) - https://football-prediction-pwa-erik-vms-projects.vercel.app/
- Database: Render PostgreSQL (Free Tier)
- **Total Cost**: $0/month

**Alternative Options**:
- Backend: Azure App Service / Railway
- Frontend: Netlify / GitHub Pages
- Database: Azure PostgreSQL / Supabase

---

## 📚 Additional Resources

### Documentation

- [Angular Documentation](https://angular.dev)
- [ASP.NET Core Documentation](https://learn.microsoft.com/aspnet/core)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Entity Framework Core](https://learn.microsoft.com/ef/core)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL management
- [Visual Studio Code](https://code.visualstudio.com/) - Code editor
- [Visual Studio 2022](https://visualstudio.microsoft.com/) - .NET IDE
- [Rider](https://www.jetbrains.com/rider/) - .NET IDE alternative

---

## 🎓 Learning Path

### For New Developers

1. Read [REQUIREMENTS.md](REQUIREMENTS.md) - Understand the product
2. Read [GAME-RULES.md](GAME-RULES.md) - Understand the core logic
3. Read [TECH-STACK.md](TECH-STACK.md) - Learn the tools
4. Read relevant agent guide - Learn the workflow
5. Explore reference implementation - See it in action
6. Start with small tasks - Build confidence

---

## ⚠️ Common Pitfalls

### For AI Agents

1. **DO NOT** implement scoring without reading GAME-RULES.md
2. **DO NOT** copy from Flutter app (rules are wrong)
3. **DO NOT** skip security guidelines
4. **DO NOT** add dependencies without asking
5. **DO NOT** commit without running checks

### For Developers

1. **DO NOT** store tokens in localStorage
2. **DO NOT** use `any` type in TypeScript
3. **DO NOT** skip input validation
4. **DO NOT** hardcode configuration
5. **DO NOT** log sensitive data

---

## 📞 Support

For questions or clarifications:
1. Check this README first
2. Read relevant specification documents
3. Review agent guidelines
4. Check reference implementation
5. Ask project lead

---

**Version**: 1.2
**Created**: 2025-01-27
**Updated**: 2026-03-04 (Added production deployment documentation)
**Status**: Complete Specification Package - PRODUCTION READY
**Production URLs**:
- Frontend: https://football-prediction-pwa-erik-vms-projects.vercel.app/
- Backend: https://football-prediction-pwa.onrender.com/api

---

## 📊 Phase Analysis

After each phase completion, a comprehensive analysis is created in the `../.analysis/` directory:

- **Phase Analysis Files**: Document lessons learned, issues encountered, and solutions
- **Purpose**: Prevent recurring problems in future phases
- **Usage**: Review before starting similar work

**Available Analyses:**
- `../.analysis/PHASE-2-ANALYSIS.md` - Authentication & Authorization (PostgreSQL port conflict, EF Core design-time issues, Windows command syntax)

---

## 📋 Checklist Before Starting Development

- [ ] Read GAME-RULES.md completely
- [ ] Read REQUIREMENTS.md completely
- [ ] Read TECH-STACK.md completely
- [ ] Read relevant agent guide (backend or frontend)
- [ ] Set up development environment
- [ ] Clone/create repository
- [ ] Install dependencies
- [ ] Verify database connection
- [ ] Run "hello world" to validate setup
- [ ] Create first branch
- [ ] Start implementing features

**Good luck! Build something great! 🚀**
