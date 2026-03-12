# Phase 0: Project Setup & Initialization

**Estimated Time**: 30 minutes
**Complexity**: Low
**Prerequisites**: None (starting from scratch)

---

## 🎯 OBJECTIVE

Create a clean project structure with git repository, tracking documents, and initial commit. This phase establishes the foundation for all subsequent development.

---

## 📋 DELIVERABLES

- [ ] Clean project directory created
- [ ] Git repository initialized
- [ ] Development branch created
- [ ] PROGRESS.md tracking document created
- [ ] TEST-RESULTS.md tracking document created
- [ ] .gitignore files created (root, backend, frontend)
- [ ] Initial commit made
- [ ] Clean working directory

---

## 🤖 AGENT DELEGATION

**Execute**: Self (Orchestrator handles setup)
**No delegation needed** - This is orchestrator's responsibility

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### Step 1: Create Project Directory

```bash
# Navigate to your projects folder
cd C:\Projects  # Or your preferred location

# Create new project directory
mkdir football-prediction-pwa-new
cd football-prediction-pwa-new

# Verify clean directory
ls -la
# Should be empty
```

**Validation**: Empty directory created

---

### Step 2: Initialize Git Repository

```bash
# Initialize git
git init

# Verify git initialized
ls -la .git
# Should show .git directory

# Create initial commit (empty tree)
git commit --allow-empty -m "chore: Initialize repository"

# Verify commit
git log --oneline
# Should show: "chore: Initialize repository"
```

**Validation**: Git repository initialized with initial commit

---

### Step 3: Create Development Branch

```bash
# Create and checkout development branch
git checkout -b development

# Verify branch
git branch
# Should show: * development (with asterisk)
```

**Validation**: Development branch created and checked out

---

### Step 4: Create PROGRESS.md

Use template from `.spec_v_2/templates/PROGRESS-template.md`

```bash
# Create PROGRESS.md
cat > PROGRESS.md << 'EOF'
# Football Prediction PWA - Development Progress

**Branch:** development
**Started:** [TODAY'S DATE]
**Status:** In Progress

---

## 📋 Development Phases

### Phase 0: Project Setup ⏳
**Status:** In Progress
**Date:** [TODAY'S DATE]

#### Tasks
- [x] Create project directory
- [x] Initialize git repository
- [x] Create development branch
- [x] Create PROGRESS.md
- [ ] Create TEST-RESULTS.md
- [ ] Create .gitignore files
- [ ] Initial commit

**Notes:**
- Clean start from .spec_v_2 system

---

### Phase 1: Backend Foundation 📅
**Status:** Not Started
**Date:** TBD

---

### Phase 2: Authentication & Authorization 📅
**Status:** Not Started
**Date:** TBD

---

[Continue for all phases...]

EOF
```

**Validation**: PROGRESS.md created with Phase 0 in progress

---

### Step 5: Create TEST-RESULTS.md

Use template from `.spec_v_2/templates/TEST-RESULTS-template.md`

```bash
# Create TEST-RESULTS.md
cat > TEST-RESULTS.md << 'EOF'
# Football Prediction PWA - Test Results

**Last Updated:** [TODAY'S DATE]
**Total Tests:** 0
**Passing:** 0
**Failing:** 0

---

## Test Summary by Phase

### Phase 0: Project Setup
**Date:** [TODAY'S DATE]
**Tests:** N/A (no code yet)

---

### Phase 1: Backend Foundation
**Status:** Not Started
**Unit Tests:** 0
**Integration Tests:** 0

---

[Continue for all phases...]

EOF
```

**Validation**: TEST-RESULTS.md created

---

### Step 6: Create Root .gitignore

```bash
# Create root .gitignore
cat > .gitignore << 'EOF'
# OS Files
.DS_Store
Thumbs.db
desktop.ini

# IDE / Editor
.vscode/
.idea/
*.swp
*.swo
*~
.project
.settings/
.classpath

# Build artifacts
*.log
*.tmp

# Environment files
.env
.env.local
.env.*.local

# Node modules (will be in frontend/)
node_modules/

# .NET build output (will be in backend/)
bin/
obj/
*.user
*.suo

# Database files
*.db
*.sqlite
*.sqlite3

# Temporary files
tmp/
temp/

# Session analyses (keep these in repo)
!.analysis/

# Specification system (keep these in repo)
!.spec_v_2/

EOF
```

**Validation**: Root .gitignore created

---

### Step 7: Commit Initial Setup

```bash
# Stage all files
git add .

# Check status
git status
# Should show: PROGRESS.md, TEST-RESULTS.md, .gitignore

# Create initial setup commit
git commit -m "$(cat <<'EOF'
chore: Initial project setup

Created project structure and tracking documents:
- PROGRESS.md for phase tracking
- TEST-RESULTS.md for test documentation
- .gitignore for version control

Phase 0: Project Setup
Status: In Progress

Next: Phase 1 - Backend Foundation
EOF
)"

# Verify commit
git log --oneline
# Should show 2 commits now
```

**Validation**: Clean commit created

---

### Step 8: Verify Clean State

```bash
# Check working directory
git status
# Should output: "nothing to commit, working tree clean"

# List files
ls -la
# Should show: .git/, PROGRESS.md, TEST-RESULTS.md, .gitignore

# Verify branch
git branch
# Should show: * development
```

**Validation**: Clean working directory on development branch

---

## ✅ VALIDATION CHECKLIST

Use `validation/PHASE-00-CHECKLIST.md` for complete validation.

**Quick Validation**:
- [ ] Project directory exists and is clean
- [ ] Git repository initialized (`.git/` directory exists)
- [ ] Development branch created and checked out
- [ ] PROGRESS.md exists and has Phase 0 entry
- [ ] TEST-RESULTS.md exists
- [ ] .gitignore exists
- [ ] 2 commits in git history
- [ ] `git status` shows clean working tree
- [ ] No build errors (nothing to build yet)

**If all checked**: ✅ Phase 0 Complete

---

## 🛡️ ERROR PREVENTION

### Known Issues

❌ **Git not installed**
```bash
# Check if git installed
git --version

# If not installed:
# Windows: Download from https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt-get install git
```

❌ **Directory already exists**
```bash
# If directory exists, choose different name
mkdir football-prediction-pwa-new-v2

# Or remove existing (careful!)
rm -rf football-prediction-pwa-new
```

❌ **Permission issues**
```bash
# Run command prompt as administrator (Windows)
# Or use sudo (Mac/Linux)
```

### Prevention Checklist

- [ ] Git installed and accessible
- [ ] Write permissions in projects directory
- [ ] No existing directory with same name
- [ ] Terminal/command prompt in correct location

---

## 📊 COMPLETION CRITERIA

Phase 0 is **COMPLETE** when:

✅ All deliverables created
✅ All validation checks pass
✅ Clean git status
✅ PROGRESS.md updated with Phase 0 complete
✅ Ready to proceed to Phase 1

---

## ⏭️ NEXT PHASE

**Phase 1: Backend Foundation**
- Create .NET 9 solution (6 projects)
- Set up Entity Framework Core
- Configure PostgreSQL with Docker
- Create domain entities
- Apply database migrations

**Preparation**:
- [ ] Read `phases/PHASE-01-BACKEND-FOUNDATION.md`
- [ ] Read `error-prevention/PHASE-01-PREVENTION.md`
- [ ] Verify prerequisites (dotnet-ef v9.0.0, Docker running)

---

## 🕐 TIME TRACKING

**Estimated**: 30 minutes
**Typical Actual**: 20-30 minutes
**Potential Delays**: Git setup issues (5-10 min if git not installed)

---

## 📝 NOTES FOR ORCHESTRATOR

### After Completion

1. **Update PROGRESS.md**:
   - Mark Phase 0 as ✅ Complete
   - Add completion date
   - Add any notes about issues encountered

2. **Update TEST-RESULTS.md**:
   - Mark Phase 0 as complete (N/A for tests)

3. **Commit Changes**:
   ```bash
   git add PROGRESS.md TEST-RESULTS.md
   git commit -m "docs: Mark Phase 0 complete"
   ```

4. **Proceed to Phase 1**:
   - Read Phase 1 documentation
   - Verify prerequisites
   - Delegate to BACKEND-AGENT

### Quality Gates

Before proceeding to Phase 1:
- ✅ All validation checks pass
- ✅ Git status clean
- ✅ Documentation updated
- ✅ No blockers identified

**Do not proceed if any validation fails.**

---

**Phase**: 0
**Version**: 2.0
**Last Updated**: 2026-03-05
**Status**: Production Ready
