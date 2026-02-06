# Football Prediction PWA

A Progressive Web App for friends to predict football match scores and compete on leaderboards during tournament seasons (primarily Champions League).

## 🎯 Project Status

**Status**: Specification Complete - Ready for Development
**Tech Stack**: Angular 19 + .NET 9 + PostgreSQL
**Based On**: Correct Spring Boot + React implementation

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
│   │   ├── BACKEND-AGENT.md
│   │   └── FRONTEND-AGENT.md
│   └── rules/                # Coding standards
├── backend/                   # .NET 9 Web API (to be created)
├── frontend/                  # Angular 19 PWA (to be created)
└── README.md                 # This file
```

---

## 🚀 Quick Start

### For AI Agents

1. **Read First**: `.specs/README.md` - Complete specification index
2. **Critical**: `.specs/GAME-RULES.md` - Scoring logic MUST match exactly
3. **Your Guide**:
   - Backend: `.specs/agents/BACKEND-AGENT.md`
   - Frontend: `.specs/agents/FRONTEND-AGENT.md`

### For Developers

1. Read `.specs/README.md` completely
2. Set up development environment (see `.specs/TECH-STACK.md`)
3. Follow your role's agent guide
4. Start with project scaffolding

---

## 📋 Key Documents

### Must Read (Before Starting)

| Document | Purpose |
|:---------|:--------|
| [.specs/GAME-RULES.md](.specs/GAME-RULES.md) | **CRITICAL**: Official scoring algorithm |
| [.specs/REQUIREMENTS.md](.specs/REQUIREMENTS.md) | What to build |
| [.specs/TECH-STACK.md](.specs/TECH-STACK.md) | How to build it |

### Agent Guidelines

| Role | Guide |
|:-----|:------|
| Backend Developer | [.specs/agents/BACKEND-AGENT.md](.specs/agents/BACKEND-AGENT.md) |
| Frontend Developer | [.specs/agents/FRONTEND-AGENT.md](.specs/agents/FRONTEND-AGENT.md) |

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

## 📦 Next Steps

1. **Project Scaffolding**
   - Create .NET solution structure
   - Create Angular application
   - Set up Git repository

2. **Database Setup**
   - PostgreSQL installation
   - Initial migration
   - Seed data

3. **CI/CD Pipeline**
   - GitHub Actions setup
   - Automated testing
   - Deployment configuration

4. **MVP Development**
   - Authentication system
   - Match management
   - Prediction submission
   - Scoring calculation
   - Leaderboards

---

## ⚡ Quick Reference

- **Specs Directory**: [.specs/](.specs/)
- **Game Rules**: [.specs/GAME-RULES.md](.specs/GAME-RULES.md)
- **Backend Guide**: [.specs/agents/BACKEND-AGENT.md](.specs/agents/BACKEND-AGENT.md)
- **Frontend Guide**: [.specs/agents/FRONTEND-AGENT.md](.specs/agents/FRONTEND-AGENT.md)
- **Reference Code**: `C:\Projects\football-prediciton-game`

---

**Version**: 1.0
**Created**: 2025-01-27
**Status**: Specification Complete
**Ready For**: Development Phase

**Start building! 🚀**
