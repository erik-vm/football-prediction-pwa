# Football Prediction PWA

A Progressive Web App for friends to predict football match scores and compete on leaderboards during tournament seasons (primarily Champions League).

## 🎯 Project Status

**Status**: Phase 0-1 Complete - Backend Foundation Ready
**Current Phase**: Ready for Phase 2 (Authentication & Authorization)
**Tech Stack**: Angular 19 + .NET 9 + PostgreSQL
**Based On**: Correct Spring Boot + React implementation

**Latest Progress:**
- ✅ Phase 0: Project Setup
- ✅ Phase 1: Backend Foundation (6 projects, database migrations applied)
- 🔜 Phase 2: Authentication & Authorization

---

## 📁 Project Structure

```
football-prediction-pwa/
├── .specs/                    # Complete project specifications
│   ├── README.md             # Specification index and guide
│   ├── GAME-RULES.md         # Official scoring rules (CRITICAL)
│   ├── REQUIREMENTS.md        # Functional requirements
│   ├── TECH-STACK.md         # Technology decisions
│   ├── agents/               # AI agent guidelines
│   │   ├── SETUP-AGENT.md            # ✨ NEW: Setup verification
│   │   ├── BACKEND-AGENT.md          # Updated with troubleshooting
│   │   ├── FRONTEND-AGENT.md
│   │   └── CODE-REVIEWER-AGENT.md    # ✨ NEW: Code review
│   ├── commands/             # ✨ NEW: Reusable command references
│   │   ├── setup-backend.md
│   │   └── database-operations.md
│   └── rules/                # Coding standards
├── .analysis/                 # ✨ NEW: Session analysis documents
│   └── 2026-02-06-phase-0-1-session.md
├── backend/                   # ✅ .NET 9 Web API (6 projects created)
├── frontend/                  # Angular 19 PWA (to be created)
├── PROGRESS.md               # ✨ NEW: Development tracking
├── TEST-RESULTS.md           # ✨ NEW: Test documentation
└── README.md                 # This file
```

---

## 🚀 Quick Start

### For AI Agents

1. **Read First**: `.specs/README.md` - Complete specification index
2. **Critical**: `.specs/GAME-RULES.md` - Scoring logic MUST match exactly
3. **Your Guide**: Choose your role
   - Setup/Onboarding: `.specs/agents/SETUP-AGENT.md` ⭐ **Start here if new**
   - Backend Development: `.specs/agents/BACKEND-AGENT.md`
   - Frontend Development: `.specs/agents/FRONTEND-AGENT.md`
   - Code Review: `.specs/agents/CODE-REVIEWER-AGENT.md`

4. **Quick Commands**: `.specs/commands/` - Reusable command references

### For Developers

1. **Verify Prerequisites** - Run version checks (see setup-backend.md)
2. Read `.specs/README.md` completely
3. Set up development environment (follow `.specs/commands/setup-backend.md`)
4. Check `PROGRESS.md` for current status
5. Follow your role's agent guide

---

## 📋 Key Documents

### Must Read (Before Starting)

| Document | Purpose |
|:---------|:--------|
| [.specs/GAME-RULES.md](.specs/GAME-RULES.md) | **CRITICAL**: Official scoring algorithm |
| [.specs/REQUIREMENTS.md](.specs/REQUIREMENTS.md) | What to build |
| [.specs/TECH-STACK.md](.specs/TECH-STACK.md) | How to build it |

### Agent Guidelines

| Role | Guide | Purpose |
|:-----|:------|:--------|
| **Setup Agent** | [SETUP-AGENT.md](.specs/agents/SETUP-AGENT.md) | Environment setup, prerequisite verification |
| **Backend Developer** | [BACKEND-AGENT.md](.specs/agents/BACKEND-AGENT.md) | .NET 9 API development (updated with troubleshooting) |
| **Frontend Developer** | [FRONTEND-AGENT.md](.specs/agents/FRONTEND-AGENT.md) | Angular 19 PWA development |
| **Code Reviewer** | [CODE-REVIEWER-AGENT.md](.specs/agents/CODE-REVIEWER-AGENT.md) | Code review, quality assurance |

### Command References

| Command Set | File | Contains |
|:------------|:-----|:---------|
| **Backend Setup** | [setup-backend.md](.specs/commands/setup-backend.md) | Complete backend setup procedure |
| **Database Operations** | [database-operations.md](.specs/commands/database-operations.md) | Migrations, queries, troubleshooting |

---

## ⚠️ Critical Information

### Scoring System

This project rewrites a Flutter app that has **INCORRECT** scoring rules.

**Source of Truth**: `.specs/GAME-RULES.md`

**DO NOT** implement different logic. The scoring algorithm is:
- 5 points: Exact score match
- 4 points: Correct winner + goal difference
- 3 points: Correct winner only
- 1 point: One team score correct
- 0 points: No match

### Reference Implementations

- ✅ **Correct**: `C:\Projects\football-prediciton-game` (Spring Boot + React)
- ❌ **Incorrect**: `C:\Projects\taltech\icd0011exercises\football_prediction_app` (Flutter)

---

## 🛠️ Technology Stack

### Backend
- ASP.NET Core 9 Web API
- Entity Framework Core 9
- PostgreSQL 16+
- JWT Authentication
- Serilog, FluentValidation, AutoMapper

### Frontend
- Angular 19 (Standalone Components)
- TypeScript 5.7+
- Tailwind CSS
- PWA with Service Worker
- RxJS + Angular Signals

### Infrastructure
- Backend: Azure App Service / Railway
- Frontend: Vercel / Netlify
- Database: Azure PostgreSQL / Supabase

---

## 📚 Documentation Structure

```
.specs/
├── README.md                  # Specification index
├── GAME-RULES.md             # Scoring algorithm (CRITICAL)
├── REQUIREMENTS.md            # Functional requirements
├── TECH-STACK.md             # Technology specifications
├── agents/
│   ├── BACKEND-AGENT.md      # .NET development guide
│   └── FRONTEND-AGENT.md     # Angular development guide
└── rules/
    ├── security.mdc          # Security best practices
    ├── csharp-dotnet-standards.mdc
    └── component-technical-standards.mdc
```

---

## 🎯 Development Workflow

### 1. Setup

```bash
# Read specifications
cat .specs/README.md

# Backend (when created)
cd backend
dotnet restore
dotnet ef database update
dotnet run

# Frontend (when created)
cd frontend
npm install
ng serve
```

### 2. Development

1. Read relevant spec documents
2. Implement feature following agent guidelines
3. Write tests
4. Run validation

### 3. Pre-Commit

```bash
# Backend
dotnet format && dotnet build && dotnet test

# Frontend
npm run lint && npm run build && npm test -- --watch=false
```

---

## 🔒 Security Requirements

- JWT authentication (access + refresh tokens)
- BCrypt password hashing (work factor 12)
- HTTPS only (TLS 1.3)
- Security headers (CSP, HSTS, etc.)
- Input validation on all endpoints
- SQL injection prevention
- XSS prevention

See `.specs/rules/security.mdc` for complete security checklist.

---

## ✅ Success Criteria

### Technical
- Zero scoring calculation errors
- 99.5% uptime during tournaments
- < 2 second page load (4G mobile)
- Lighthouse PWA score: 100

### Functional
- All requirements implemented
- Scoring matches GAME-RULES.md exactly
- PWA installable on mobile
- Offline submission works

---

## 📞 Getting Started

### AI Agents

Start here: [.specs/README.md](.specs/README.md)

### Human Developers

1. Read [.specs/README.md](.specs/README.md)
2. Read [.specs/GAME-RULES.md](.specs/GAME-RULES.md)
3. Read [.specs/REQUIREMENTS.md](.specs/REQUIREMENTS.md)
4. Read your agent guide (backend or frontend)
5. Set up development environment
6. Begin project scaffolding

---

## 🎓 Project Background

This is a complete rewrite of an existing Flutter mobile app using Angular PWA + .NET 9 with correct game rules extracted from a working Spring Boot + React implementation.

**Purpose**:
- Correct the wrong scoring rules in Flutter app
- Provide better web experience with PWA
- Use enterprise-grade tech stack
- Enable offline functionality

---

## 🛠️ Quick Setup

**Prerequisites Check:**
```bash
# Verify versions
dotnet --version  # Need 9.x or 10.x
dotnet ef --version  # MUST be 9.0.0 (not 10.x!)
docker --version

# Fix dotnet-ef if wrong version
dotnet tool uninstall --global dotnet-ef
dotnet tool install --global dotnet-ef --version 9.0.0
```

**Backend Setup:**
```bash
cd backend

# Start PostgreSQL
docker-compose up -d

# Apply migrations (SQL script method - most reliable)
cd src/FootballPrediction.Infrastructure
dotnet ef migrations script --output migration.sql
cd ../..
docker exec -i football_prediction_db psql -U postgres -d football_prediction < src/FootballPrediction.Infrastructure/migration.sql

# Verify (should show 6 tables)
docker exec football_prediction_db psql -U postgres -d football_prediction -c '\dt'

# Build and run
dotnet build
dotnet run --project src/FootballPrediction.Api

# Test health endpoint
curl http://localhost:5206/health
```

**Full Setup Guide:** See `.specs/commands/setup-backend.md`

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|:------|:------|:---------|
| `System.Runtime, Version=10.0.0.0` not found | dotnet-ef v10 with .NET 9 project | Downgrade to `dotnet-ef 9.0.0` |
| Migration says "Done" but no tables | EF Core state issue | Use SQL script method (see setup-backend.md) |
| `Package X not compatible with net9.0` | Wrong package version | Use version 9.x packages |
| Docker connection refused | Docker not running | Start Docker Desktop |
| Port 5432 already in use | Another PostgreSQL running | Stop other instance or change port |

**Full Troubleshooting Guide:** See `.specs/agents/BACKEND-AGENT.md` → Troubleshooting section

---

## 📊 Session Analysis

After each development phase, create an analysis document in `.analysis/`:

**Example:** `.analysis/2026-02-06-phase-0-1-session.md`

**Contents:**
- What was accomplished
- Issues encountered and solutions
- Time spent on blockers
- Lessons learned
- Prevention strategies for future sessions

**Purpose:** Help future sessions avoid the same issues.

---

## 📦 Development Progress

**Phase 0: Project Setup** ✅
- Development branch created
- Tracking documents (PROGRESS.md, TEST-RESULTS.md)
- Backend project structure (6 projects)

**Phase 1: Backend Foundation** ✅
- Domain entities and configurations
- EF Core migrations applied
- PostgreSQL database operational
- API health check working
- Solution builds with 0 errors

**Phase 2: Authentication & Authorization** 🔜
- JWT token generation
- User registration/login
- Password hashing (BCrypt)
- Authorization policies

**See PROGRESS.md for detailed phase breakdown**

---

## ⚡ Quick Reference

- **Specs Directory**: [.specs/](.specs/)
- **Game Rules**: [.specs/GAME-RULES.md](.specs/GAME-RULES.md)
- **Backend Guide**: [.specs/agents/BACKEND-AGENT.md](.specs/agents/BACKEND-AGENT.md)
- **Frontend Guide**: [.specs/agents/FRONTEND-AGENT.md](.specs/agents/FRONTEND-AGENT.md)
- **Reference Code**: `C:\Projects\football-prediciton-game`

---

**Version**: 1.1
**Created**: 2025-01-27
**Last Updated**: 2026-02-06
**Status**: Phase 1 Complete
**Ready For**: Phase 2 - Authentication & Authorization

**Continue building! 🚀**

---

## 📚 Additional Resources

- **Progress Tracking:** `PROGRESS.md`
- **Test Results:** `TEST-RESULTS.md`
- **Session Analysis:** `.analysis/` directory
- **Command References:** `.specs/commands/` directory
- **Agent Guidelines:** `.specs/agents/` directory
