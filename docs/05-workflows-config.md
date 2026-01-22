# Phase 5: Workflows & Configuration

## Overview
Define workflow patterns and configuration files for ClaudeKit.

## Workflow System

Workflows define how multiple agents coordinate to complete complex tasks.

```
.claude/
└── workflows/
    ├── feature-development.md    # Primary development workflow
    ├── bug-fixing.md             # Debug and fix workflow
    └── project-init.md           # New project workflow
```

## Workflow Specifications

### 1. Feature Development Workflow

**File**: `.claude/workflows/feature-development.md`

**Purpose**: Standard flow for implementing new features

**Agents**: planner → fullstack-developer → tester → code-reviewer → git-manager

**Flow**:
```mermaid
graph LR
    A[User Request] --> B[/plan command]
    B --> C[planner agent]
    C --> D[Plan created]
    D --> E[/cook command]
    E --> F[fullstack-developer]
    F --> G[/test command]
    G --> H[tester agent]
    H --> I{Tests pass?}
    I -->|No| F
    I -->|Yes| J[code-reviewer]
    J --> K[/git:cm command]
    K --> L[git-manager]
    L --> M[Committed]
```

**Structure**:
```markdown
# Feature Development Workflow

## Trigger
User wants to add a new feature.

## Steps

### 1. Plan Creation
**Command**: `/plan [feature description]`
**Agent**: planner
**Output**: `plans/YYMMDD-feature.md`

The planner agent:
- Spawns 3 researchers in parallel
- Analyzes existing codebase
- Creates detailed implementation plan

### 2. Implementation
**Command**: `/cook plans/YYMMDD-feature.md`
**Agent**: fullstack-developer
**Output**: Working feature

The developer agent:
- Follows the plan precisely
- Creates/modifies files
- Writes tests
- Updates documentation

### 3. Testing
**Command**: `/test`
**Agent**: tester
**Output**: Test results

The tester agent:
- Runs test suite
- Analyzes coverage
- Reports any failures

### 4. Code Review
**Agent**: code-reviewer
**Output**: Security and quality report

The reviewer agent:
- Checks for security issues
- Analyzes performance
- Validates code quality

### 5. Commit
**Command**: `/git:cm`
**Agent**: git-manager
**Output**: Clean git commit

The git agent:
- Analyzes changes
- Generates conventional commit message
- Stages and commits
- Runs pre-commit hooks

## Estimated Time
- Simple feature: 5-10 minutes
- Medium feature: 15-30 minutes
- Complex feature: 30-60 minutes

## Success Criteria
- Plan reviewed and approved
- All tests passing
- Code review approved
- Committed with conventional message
- Documentation updated
```

---

### 2. Bug Fixing Workflow

**File**: `.claude/workflows/bug-fixing.md`

**Purpose**: Standard flow for debugging and fixing issues

**Agents**: scout → debugger → planner → fullstack-developer → tester → git-manager

**Flow**:
```mermaid
graph LR
    A[Bug Report] --> B[/debug command]
    B --> C[debugger agent]
    C --> D[Root cause found]
    D --> E[/fix:fast or /fix:hard]
    E --> F[fullstack-developer]
    F --> G[/test command]
    G --> H[tester agent]
    H --> I[/git:cm command]
    I --> J[git-manager]
    J --> K[Fixed and committed]
```

**Structure**:
```markdown
# Bug Fixing Workflow

## Trigger
User reports a bug or issue.

## Steps

### 1. Investigation
**Command**: `/debug [issue description]`
**Agent**: debugger
**Output**: Root cause analysis

The debugger agent:
- Gathers context (logs, errors)
- Reproduces the issue
- Identifies root cause
- Suggests fix

### 2. Fix Selection
**Simple bugs**: `/fix:fast [issue]`
**Complex bugs**: `/fix:hard [issue]`

### 3. Fix Implementation
**Agent**: fullstack-developer
**Output**: Fixed code

The developer agent:
- Applies the fix
- Writes test to prevent regression
- Updates docs if needed

### 4. Verification
**Command**: `/test`
**Agent**: tester
**Output**: Test results

### 5. Commit
**Command**: `/git:cm`
**Agent**: git-manager
**Output**: Commit with `fix:` type

## Bug Categories

### Simple Bugs (use /fix:fast)
- Typos
- Missing imports
- Simple logic errors
- Configuration issues

### Complex Bugs (use /fix:hard)
- Race conditions
- Memory leaks
- Performance issues
- Architecture problems
- Security vulnerabilities

## Estimated Time
- Simple bug: 2-5 minutes
- Complex bug: 15-45 minutes
```

---

### 3. Project Initialization Workflow

**File**: `.claude/workflows/project-init.md`

**Purpose**: Standard flow for starting new projects

**Agents**: fullstack-developer (bootstrap)

**Flow**:
```mermaid
graph LR
    A[New Project] --> B[/bootstrap command]
    B --> C[fullstack-developer]
    C --> D[Project created]
    D --> E[/git:cm command]
    E --> F[git-manager]
    F --> G[Initial commit]
```

**Structure**:
```markdown
# Project Initialization Workflow

## Trigger
User wants to start a new project.

## Steps

### 1. Bootstrap
**Command**: `/bootstrap [project description]`
**Agent**: fullstack-developer
**Output**: New project structure

The developer agent:
- Asks for project type
- Recommends tech stack
- Creates project structure
- Generates initial files
- Sets up configuration

### 2. Initial Commit
**Command**: `/git:cm`
**Agent**: git-manager
**Output**: First commit

## Tech Stack Recommendations

### Web Application
- **Framework**: Next.js 15
- **UI**: shadcn-ui
- **Styling**: Tailwind CSS
- **Auth**: better-auth
- **DB**: PostgreSQL + Prisma

### API
- **Runtime**: Node.js/Bun
- **Framework**: Fastify/Hono
- **Validation**: Zod
- **Docs**: OpenAPI

### Library
- **Language**: TypeScript
- **Builder**: tsup/unbuild
- **Test**: Vitest
- **Docs**: TypeDoc

## Initial Files Created
- README.md
- .gitignore
- package.json
- tsconfig.json
- src/
- .claude/ (with ClaudeKit)

## Estimated Time
5-10 minutes
```

---

## Configuration Files

### metadata.json

**Location**: `.claude/metadata.json`

**Purpose**: Track kit version and installation state

```json
{
  "kit": "engineer",
  "version": "1.0.0",
  "installedAt": "2025-01-22T00:00:00.000Z",
  "kits": {
    "engineer": "1.0.0"
  },
  "files": {
    "sha256": {
      ".claude/agents/planner.md": "abc123...",
      ".claude/commands/core/cook.md": "def456..."
    }
  }
}
```

---

### settings.json

**Location**: `.claude/settings.json`

**Purpose**: User-configurable settings

```json
{
  "commands": {
    "setup": [],
    "pre-commit": [],
    "post-commit": []
  },
  "hooks": {
    "pre-commit": [
      {
        "type": "exec",
        "command": "npm run lint"
      },
      {
        "type": "exec",
        "command": "npm run test"
      }
    ],
    "post-commit": [
      {
        "type": "exec",
        "command": "npm run build"
      }
    ]
  },
  "preferences": {
    "defaultBranch": "main",
    "commitType": "conventional",
    "testFramework": "auto-detect"
  }
}
```

---

### settings.local.json

**Location**: `.claude/settings.local.json`

**Purpose**: Local overrides (gitignored)

```json
{
  "permissions": {
    "allow": [
      "mcp__web-reader__webReader",
      "mcp__zai-mcp-server__analyze_video",
      "mcp__zai-mcp-server__analyze_image"
    ]
  },
  "env": {
    "CLAUDEKIT_PATH": "./kits/default"
  }
}
```

---

### CLAUDE.md

**Location**: `CLAUDE.md` (project root)

**Purpose**: Project-specific context for Claude Code

```markdown
# [Project Name]

## Project Overview
[Brief description of what this project does]

## Tech Stack
- [Framework]
- [Language]
- [Database]
- [Deployment]

## Architecture
[High-level architecture description]

## Key Files
- `src/main.ts` - Entry point
- `src/config/` - Configuration
- `src/routes/` - API routes

## Development Commands
- `npm run dev` - Start development server
- `npm run test` - Run tests
- `npm run build` - Build for production

## ClaudeKit Configuration
- Kit: engineer v1.0.0
- Custom agents: none
- Custom skills: none

## Notes
[Any additional context for Claude Code]
```

---

## Files to Create

| File | Lines Estimate | Priority |
|------|---------------|----------|
| `.claude/workflows/feature-development.md` | 100 | P0 |
| `.claude/workflows/bug-fixing.md` | 80 | P0 |
| `.claude/workflows/project-init.md` | 80 | P0 |
| `.claude/metadata.json` | 20 | P0 |
| `.claude/settings.json` | 30 | P0 |
| `.claude/settings.local.json` | 15 | P0 |
| `CLAUDE.md` | 40 | P0 |

**Total**: ~365 lines across 7 files

## Directory Structure Summary

After implementing all phases, the complete structure:

```
claude-kit/
├── cli/                          # Phase 1
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   └── bin/
│
├── kits/
│   └── default/
│       └── .claude/
│           ├── agents/           # Phase 2 (5 agents)
│           │   ├── planner.md
│           │   ├── fullstack-developer.md
│           │   ├── researcher.md
│           │   ├── tester.md
│           │   └── debugger.md
│           │
│           ├── commands/         # Phase 3 (8 commands)
│           │   ├── core/
│           │   │   ├── bootstrap.md
│           │   │   ├── cook.md
│           │   │   ├── plan.md
│           │   │   ├── test.md
│           │   │   ├── debug.md
│           │   │   └── ask.md
│           │   ├── fix/
│           │   │   └── fast.md
│           │   └── git/
│           │       └── commit.md
│           │
│           ├── skills/           # Phase 4 (11 skills)
│           │   ├── frontend-development/
│           │   ├── backend-development/
│           │   ├── ios-development/
│           │   ├── nextjs/
│           │   ├── shadcn-ui/
│           │   ├── planning/
│           │   ├── research/
│           │   ├── debugging/
│           │   ├── better-auth/
│           │   ├── databases/
│           │   └── docker/
│           │
│           ├── workflows/        # Phase 5
│           │   ├── feature-development.md
│           │   ├── bug-fixing.md
│           │   └── project-init.md
│           │
│           ├── metadata.json
│           ├── settings.json
│           └── settings.local.json
│
└── docs/                         # Planning documentation
    ├── 01-cli-tool.md
    ├── 02-agents.md
    ├── 03-commands.md
    ├── 04-skills.md
    └── 05-workflows-config.md
```

## Implementation Verification

Complete end-to-end test:

```bash
# 1. Install CLI
cd cli && bun link

# 2. Create new project
cd /tmp
ck new test-app
cd test-app

# 3. Verify structure
ls -la .claude/
# Should show: agents/, commands/, skills/, workflows/, *.json

# 4. Test workflow
/plan add user authentication
# Creates: plans/YYMMDD-auth.md

/cook plans/auth.md
# Implements auth feature

/test
# Runs tests, shows coverage

/git:cm
# Commits with conventional message
```

## Summary Statistics

| Component | Files | Lines |
|-----------|-------|-------|
| CLI Tool | 15 | ~605 |
| Agents | 5 | ~640 |
| Commands | 8 | ~720 |
| Skills | 11 | ~1,480 |
| Workflows/Config | 7 | ~365 |
| **Total** | **46** | **~3,810** |

## Next Steps After Phase 5

1. **Additional Agents** (12 more)
   - code-reviewer, git-manager, scout, docs-manager, project-manager, etc.

2. **More Commands** (58 more)
   - fix:*, design:*, content:*, docs:*, plan:*, integrate:*

3. **More Skills** (39 more)
   - ui-styling, threejs, devops, mcp-builder, etc.

4. **Advanced Features**
   - GitHub integration for kit updates
   - Multi-kit support
   - Custom agent builder
   - Skill creator
