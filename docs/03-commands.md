# Phase 3: Commands Implementation

## Overview
Create 8 core slash commands that orchestrate AI agents for development tasks.

## Command System Architecture

Commands are markdown files that define user-facing slash commands in Claude Code.

```
.claude/
└── commands/
    ├── core/
    │   ├── bootstrap.md    # Initialize new projects
    │   ├── cook.md         # Implement features (primary)
    │   ├── plan.md         # Create plans
    │   ├── test.md         # Run tests
    │   ├── debug.md        # Debug issues
    │   └── ask.md          # Query codebase
    ├── fix/
    │   └── fast.md         # Quick bug fixes
    └── git/
        └── commit.md       # Commit changes
```

## Command Specifications

### 1. Bootstrap Command (`core/bootstrap.md`)

**Syntax**: `/bootstrap [project description]`

**Purpose**: Initialize a new project from scratch

**Agent**: fullstack-developer

**Workflow**:
1. Ask for project type (web app, API, library, etc.)
2. Select tech stack
3. Create project structure
4. Install dependencies
5. Set up basic files (README, git, etc.)

**Output**: New project ready for development

**Structure**:
```markdown
---
title: Bootstrap Command
description: Initialize a new project from scratch
agent: fullstack-developer
---

# Bootstrap Command

Initialize a new project with best practices.

## Usage
/bootstrap [project description]

## Your Process
1. Ask for project type if not specified
2. Recommend tech stack based on requirements
3. Create project structure
4. Install dependencies
5. Generate initial files

## Project Structure to Create
- README.md
- .gitignore
- package.json (if applicable)
- src/ directory
- Basic configuration files

## Tech Stack Recommendations
- Web app: Next.js + shadcn-ui
- API: Node.js + Express/Fastify
- Library: TypeScript
- Mobile: React Native

## Completion
Report:
- Project type
- Tech stack chosen
- Files created
- Next steps
```

---

### 2. Cook Command (`core/cook.md`)

**Syntax**: `/cook [feature description]`

**Purpose**: Implement features (primary development command)

**Agent**: fullstack-developer

**Workflow**:
1. If no plan exists, create one first
2. Implement from plan
3. Write tests
4. Update docs

**Output**: Working feature with tests

**Structure**:
```markdown
---
title: Cook Command
description: Implement features from plans or descriptions
agent: fullstack-developer
---

# Cook Command

Implement features - the main development command.

## Usage
/cook [feature description]
/cook plans/[plan-file].md

## Your Process

### If plan file provided:
1. Read the plan
2. Implement precisely
3. Write tests
4. Update docs

### If only description:
1. Ask: should I create a plan first?
2. If yes: create plan, then implement
3. If no: implement directly

## Implementation Steps
1. Install dependencies (if needed)
2. Create files in order
3. Modify existing files
4. Write tests
5. Update documentation
6. Verify it works

## Rules
- Follow plans exactly when provided
- Always write tests for new code
- Update relevant docs
- Report progress per file

## Completion
Report:
- Files created: [count]
- Files modified: [count]
- Tests written: [count]
- How to test
- Any issues
```

---

### 3. Plan Command (`core/plan.md`)

**Syntax**: `/plan [feature description]`

**Purpose**: Create detailed implementation plans

**Agent**: planner

**Workflow**:
1. Spawn 3 researchers in parallel
2. Aggregate findings
3. Create detailed plan
4. Save to plans/ directory

**Output**: `plans/YYMMDD-feature.md`

**Structure**:
```markdown
---
title: Plan Command
description: Create detailed implementation plans
agent: planner
---

# Plan Command

Create detailed implementation plans before coding.

## Usage
/plan [feature description]

## Your Process
1. Parse the feature request
2. Spawn 3 researcher agents:
   - Best practices research
   - Existing codebase analysis
   - Dependencies check
3. Aggregate findings
4. Create detailed plan
5. Save to plans/ directory

## Plan Template
See planner.md agent for template

## Completion
Report:
- Plan created: plans/[filename].md
- Summary of research
- Implementation steps count
- Files to create/modify
- Estimated complexity
- Next: /code plans/[filename].md
```

---

### 4. Test Command (`core/test.md`)

**Syntax**: `/test`

**Purpose**: Run and analyze test suite

**Agent**: tester

**Workflow**:
1. Detect test framework
2. Run tests
3. Analyze coverage
4. Report results

**Output**: Test results with coverage

**Structure**:
```markdown
---
title: Test Command
description: Run test suite and analyze coverage
agent: tester
---

# Test Command

Run tests and analyze coverage.

## Usage
/test
/test [specific test file]

## Your Process
1. Identify test framework (Jest, Vitest, pytest, etc.)
2. Run the test suite
3. Parse results
4. Calculate coverage
5. Report findings

## Output
- Total tests run
- Pass/fail counts
- Coverage percentage
- Failure details (if any)
- Recommendations

## If Tests Fail
1. Identify which tests failed
2. Analyze why they failed
3. Suggest fixes
```

---

### 5. Debug Command (`core/debug.md`)

**Syntax**: `/debug [issue description]`

**Purpose**: Investigate and diagnose issues

**Agent**: debugger

**Workflow**:
1. Gather context (logs, errors)
2. Reproduce issue
3. Analyze code
4. Identify root cause
5. Suggest fix

**Output**: Root cause analysis with fix suggestion

**Structure**:
```markdown
---
title: Debug Command
description: Investigate and diagnose issues
agent: debugger
---

# Debug Command

Find and explain root causes of issues.

## Usage
/debug [issue description]
/debug [error log]

## Your Process
1. Understand the symptom
2. Gather context:
   - Recent changes
   - Error messages
   - Stack traces
3. Investigate code
4. Identify root cause
5. Suggest fix

## Debug Framework
1. Reproduce the issue
2. Isolate the problem
3. Analyze what's happening
4. Form hypothesis
5. Verify with fix

## Output
- Root cause identified
- Affected files
- Suggested fix (diff)
- Verification steps
```

---

### 6. Ask Command (`core/ask.md`)

**Syntax**: `/ask [question about codebase]`

**Purpose**: Query codebase for information

**Agent**: researcher

**Workflow**:
1. Understand the question
2. Search relevant files
3. Analyze code
4. Provide answer

**Output**: Answer with file references

**Structure**:
```markdown
---
title: Ask Command
description: Ask questions about the codebase
agent: researcher
---

# Ask Command

Get answers about your codebase.

## Usage
/ask [question]
/ask how does [feature] work?
/ask where is [component] used?

## Your Process
1. Parse the question
2. Search for relevant files:
   - Use grep for keywords
   - Use glob for patterns
   - Read likely files
3. Analyze code
4. Formulate answer

## Answer Format
- Direct answer
- Relevant files with paths
- Code examples if helpful
- Line numbers for reference

## Common Questions
- How does X work?
- Where is Y used?
- What's the architecture of Z?
- Why is this implemented this way?
```

---

### 7. Fix Fast Command (`fix/fast.md`)

**Syntax**: `/fix:fast [simple bug description]`

**Purpose**: Quick fixes for simple bugs

**Agent**: debugger → fullstack-developer

**Workflow**:
1. Diagnose issue
2. Apply fix
3. Verify
4. Write test if needed

**Output**: Bug fixed

**Structure**:
```markdown
---
title: Fix Fast Command
description: Quick fixes for simple bugs
agent: debugger, fullstack-developer
---

# Fix Fast Command

Quick fixes for simple, obvious bugs.

## Usage
/fix:fast [bug description]
/fix:fast typo in login button

## Your Process
1. Diagnose the issue (debugger)
2. Apply the fix (fullstack-developer)
3. Verify it works
4. Add test if needed

## When to Use
- Typos
- Simple logic errors
- Missing imports
- Obvious bugs
- Quick fixes (under 5 minutes)

## When NOT to Use
- Complex issues (use /fix:hard)
- Performance problems
- Architecture changes
- Security issues

## Completion
Report:
- Issue found
- Fix applied
- Files changed
- How to verify
```

---

### 8. Git Commit Command (`git/commit.md`)

**Syntax**: `/git:cm`

**Purpose**: Stage and commit changes with conventional commits

**Agent**: git-manager

**Workflow**:
1. Analyze changes
2. Generate commit message
3. Stage files
4. Create commit
5. Run pre-commit hooks

**Output**: Clean commit with conventional message

**Structure**:
```markdown
---
title: Git Commit Command
description: Stage and commit with conventional commits
agent: git-manager
---

# Git Commit Command

Create professional git commits.

## Usage
/git:cm

## Your Process
1. Run `git status` to see changes
2. Run `git diff` to see details
3. Categorize changes:
   - feat: New feature
   - fix: Bug fix
   - refactor: Code refactoring
   - docs: Documentation
   - test: Tests
   - chore: Maintenance
4. Generate conventional commit message
5. Stage relevant files
6. Create commit
7. Run pre-commit hooks if configured

## Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Rules
- Never commit sensitive files (.env, secrets)
- Never include Claude credentials
- Use conventional commit format
- Keep description under 72 chars
- Include body for significant changes

## Completion
Report:
- Files staged
- Commit message
- Commit hash
- Any hooks run
```

---

## Files to Create

| Command File | Lines Estimate | Priority |
|--------------|---------------|----------|
| `.claude/commands/core/bootstrap.md` | 100 | P0 |
| `.claude/commands/core/cook.md` | 120 | P0 |
| `.claude/commands/core/plan.md` | 80 | P0 |
| `.claude/commands/core/test.md` | 80 | P0 |
| `.claude/commands/core/debug.md` | 90 | P0 |
| `.claude/commands/core/ask.md` | 70 | P0 |
| `.claude/commands/fix/fast.md` | 80 | P0 |
| `.claude/commands/git/commit.md` | 100 | P0 |

**Total**: ~720 lines across 8 files

## Command Categories

### Development
- `/bootstrap` - New projects
- `/cook` - Implement features
- `/plan` - Create plans
- `/ask` - Query codebase

### Quality
- `/test` - Run tests
- `/debug` - Debug issues

### Fixes
- `/fix:fast` - Quick fixes

### Git
- `/git:cm` - Commit changes

## Verification

```bash
# Test bootstrap
/bootstrap create a todo app with Next.js

# Test plan
/plan add user authentication

# Test cook
/cook add login page

# Test test
/test

# Test debug
/debug users can't login

# Test ask
/ask how does authentication work?

# Test fix
/fix:fast typo in header

# Test git
/git:cm
```

## Future Commands (Not in Phase 3)

### Fix Commands
- `/fix:hard` - Complex issues
- `/fix:ci` - CI/CD failures
- `/fix:logs` - Log analysis
- `/fix:test` - Test failures
- `/fix:ui` - UI bugs
- `/fix:types` - TypeScript errors

### Git Commands
- `/git:cp` - Commit and push
- `/git:pr` - Create pull request

### Design Commands
- `/design:fast` - Quick design
- `/design:good` - Complete design
- `/design:screenshot` - Image to code
- `/design:video` - Video to code

### Content Commands
- `/content:fast` - Quick content
- `/content:good` - High-quality content
- `/content:enhance` - Improve existing

### Documentation Commands
- `/docs:init` - Initialize docs
- `/docs:update` - Update docs
- `/docs:summarize` - Summarize docs
