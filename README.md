# ClaudeKit

> AI-powered development toolkit for Claude Code - Build projects faster with intelligent agents, commands, and skills.

## What is ClaudeKit?

ClaudeKit is a CLI tool that initializes projects with AI development kits. It provides:

- **CLI Tool** (`ck`) - Initialize and manage ClaudeKit-powered projects
- **AI Agents** - Specialized agents for planning, development, testing, and debugging
- **Slash Commands** - User-friendly commands for common workflows
- **Domain Skills** - Expert knowledge for specific technologies (iOS, Next.js, React, etc.)
- **Workflows** - Orchestrate multiple agents for complex tasks

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-kit.git
cd claude-kit

# Install the CLI
cd cli
bun install
bun link
```

### Create a New Project

```bash
# Create a new project with ClaudeKit
ck new my-app
cd my-app

# Or initialize an existing project
cd existing-project
ck init .
```

## CLI Commands

### `ck new [name]`

Create a new project with ClaudeKit initialized.

```bash
ck new my-todo-app
```

Creates:
- Project directory with git initialized
- `.claude/` folder with agents, commands, and skills
- Basic files (README.md, .gitignore)

### `ck init [path]`

Initialize an existing project with ClaudeKit.

```bash
cd my-project
ck init .
```

Adds ClaudeKit to your current project without modifying existing files.

### `ck --version`

Display the current version of ClaudeKit CLI.

## Claude Code Commands

Once your project is initialized with ClaudeKit, you can use these slash commands in Claude Code:

### Development Commands

#### `/bootstrap [description]`

Initialize a new project from scratch.

```bash
/bootstrap create a todo app with Next.js and shadcn-ui
```

Prompts for:
- Project type (web app, API, library, mobile)
- Tech stack recommendations
- Creates project structure and initial files

#### `/cook [feature]` or `/cook [plan-file]`

Implement features - the primary development command.

```bash
# Implement from description
/cook add user authentication with Google OAuth

# Implement from existing plan
/cook plans/240122-user-auth.md
```

Process:
1. Creates plan if none exists
2. Implements the feature
3. Writes tests
4. Updates documentation

#### `/plan [feature]`

Create detailed implementation plans.

```bash
/plan add real-time notifications with WebSockets
```

Creates a plan in `plans/` directory with:
- Research findings from 3 parallel researchers
- Implementation steps
- Files to create/modify
- Test cases needed
- Estimated complexity

#### `/ask [question]`

Query your codebase.

```bash
/ask how does the authentication flow work?
/ask where is the UserProfile component used?
/ask what's the architecture of the payment system?
```

### Quality Commands

#### `/test`

Run test suite and analyze coverage.

```bash
/test
/test tests/auth/Login.test.tsx
```

Provides:
- Test results (pass/fail counts)
- Coverage percentages
- Failure analysis
- Recommendations for improvement

#### `/debug [issue]`

Investigate and diagnose issues.

```bash
/debug users can't login after password reset
/debug [paste error log]
```

Process:
1. Gathers context (logs, errors, recent changes)
2. Reproduces the issue
3. Identifies root cause
4. Suggests fix with verification steps

### Fix Commands

#### `/fix:fast [bug]`

Quick fixes for simple bugs.

```bash
/fix:fast typo in login button label
/fix:fast missing import in UserProfile.tsx
```

Best for:
- Typos
- Missing imports
- Simple logic errors
- Quick fixes (under 5 minutes)

### Git Commands

#### `/git:cm`

Stage and commit changes with conventional commits.

```bash
/git:cm
```

Process:
1. Analyzes changes with `git status` and `git diff`
2. Categorizes changes (feat, fix, refactor, docs, test, chore)
3. Generates conventional commit message
4. Stages relevant files
5. Creates commit
6. Runs pre-commit hooks if configured

## AI Agents

ClaudeKit includes specialized AI agents that work together:

| Agent | Purpose |
|-------|---------|
| **planner** | Research and create detailed implementation plans |
| **fullstack-developer** | Execute plans and implement features |
| **researcher** | Multi-source research for best practices |
| **tester** | Write and validate tests |
| **debugger** | Diagnose and fix issues |

### Agent Workflow Example

```
User Request: "Add user authentication"
    ↓
/planner agent spawns 3 /researcher agents
    ├── Best practices research
    ├── Existing codebase analysis
    └── Dependencies check
    ↓
Plan created: plans/240122-auth.md
    ↓
/fullstack-developer implements the plan
    ↓
/tester validates with tests
    ↓
/code-reviewer checks quality
    ↓
/git-manager commits the changes
```

## Domain Skills

ClaudeKit provides expert knowledge for specific technologies:

| Skill | Description |
|-------|-------------|
| **frontend-development** | React, hooks, state management, TypeScript |
| **backend-development** | Node.js, REST APIs, validation, middleware |
| **ios-development** | Swift 6, SwiftUI, UIKit, iOS 18+, SwiftData |
| **nextjs** | Next.js 15 App Router, Server Components, Server Actions |
| **shadcn-ui** | Radix UI components, Tailwind, forms |
| **better-auth** | Authentication setup, OAuth, sessions |
| **databases** | Prisma, Drizzle, schema design, migrations |
| **docker** | Dockerfiles, Docker Compose, containers |
| **planning** | Requirements analysis, task breakdown |
| **research** | Multi-source information gathering |
| **debugging** | Systematic debugging methodology |

Skills automatically activate based on:
- Keywords in your request
- Files in your project
- Explicit mention

## Workflows

### Feature Development Workflow

```bash
# 1. Create a plan
/plan add real-time notifications

# 2. Implement the feature
/cook plans/240122-notifications.md

# 3. Run tests
/test

# 4. Commit changes
/git:cm
```

### Bug Fixing Workflow

```bash
# 1. Investigate the issue
/debug login not working on iOS

# 2. Apply fix (simple bugs)
/fix:fast nil unwrap in LoginViewModel

# 3. Verify with tests
/test

# 4. Commit fix
/git:cm
```

### Project Initialization Workflow

```bash
# 1. Bootstrap new project
/bootstrap create a SaaS dashboard

# 2. Initial commit
/git:cm
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDEKIT_PATH` | Path to kit directory | `./kits/default` |

### Settings

`.claude/settings.json` - Project-specific settings

```json
{
  "commands": {
    "setup": [],
    "pre-commit": ["npm run lint", "npm run test"],
    "post-commit": ["npm run build"]
  },
  "preferences": {
    "defaultBranch": "main",
    "commitType": "conventional",
    "testFramework": "auto-detect"
  }
}
```

`.claude/settings.local.json` - Local overrides (gitignored)

```json
{
  "permissions": {
    "allow": [
      "mcp__web-reader__webReader",
      "mcp__zai-mcp-server__analyze_image"
    ]
  }
}
```

## Project Structure

After initialization, your project includes:

```
my-project/
├── .claude/
│   ├── agents/           # AI agent definitions
│   │   ├── planner.md
│   │   ├── fullstack-developer.md
│   │   ├── researcher.md
│   │   ├── tester.md
│   │   └── debugger.md
│   ├── commands/         # Slash command definitions
│   │   ├── core/
│   │   │   ├── bootstrap.md
│   │   │   ├── cook.md
│   │   │   ├── plan.md
│   │   │   ├── test.md
│   │   │   ├── debug.md
│   │   │   └── ask.md
│   │   ├── fix/
│   │   │   └── fast.md
│   │   └── git/
│   │       └── commit.md
│   ├── skills/           # Domain-specific expertise
│   │   ├── frontend-development/
│   │   ├── backend-development/
│   │   ├── ios-development/
│   │   ├── nextjs/
│   │   └── ...
│   ├── workflows/        # Agent orchestration
│   │   ├── feature-development.md
│   │   ├── bug-fixing.md
│   │   └── project-init.md
│   ├── metadata.json     # Kit version tracking
│   ├── settings.json     # Project settings
│   └── settings.local.json # Local overrides (gitignored)
├── plans/                # Generated implementation plans
│   └── 240122-feature.md
└── CLAUDE.md             # Project context for Claude Code
```

## Tech Stack Recommendations

ClaudeKit recommends modern tech stacks based on project type:

### Web Application
- **Framework**: Next.js 15
- **UI**: shadcn-ui
- **Styling**: Tailwind CSS
- **Auth**: better-auth
- **Database**: PostgreSQL + Prisma

### API
- **Runtime**: Node.js/Bun
- **Framework**: Fastify/Hono
- **Validation**: Zod
- **Docs**: OpenAPI

### iOS App
- **Language**: Swift 6
- **UI**: SwiftUI (primary), UIKit (fallback)
- **Persistence**: SwiftData
- **Networking**: async/await URLSession
- **Testing**: XCTest/XCUITest

### Library
- **Language**: TypeScript
- **Builder**: tsup/unbuild
- **Test**: Vitest
- **Docs**: TypeDoc

## Examples

### Example 1: Create a Web App

```bash
# 1. Create project
ck new task-manager
cd task-manager

# 2. Bootstrap with Next.js
/bootstrap create a task manager app

# 3. Add authentication
/cook add user authentication with email and OAuth

# 4. Create main feature
/plan add task CRUD operations with real-time updates
/cook plans/240122-task-crud.md

# 5. Test and commit
/test
/git:cm
```

### Example 2: Debug an Issue

```bash
# 1. Investigate
/debug app crashes when adding new task

# 2. Review findings
# Agent identifies nil unwrap in TaskViewModel

# 3. Apply fix
/fix:fast handle nil task in TaskViewModel.createTask

# 4. Verify
/test
/git:cm
```

### Example 3: iOS Development

```bash
# 1. Create iOS project
ck new MyiOSApp
cd MyiOSApp

# 2. Bootstrap iOS app
/bootstrap create an iOS app with SwiftUI

# 3. Add feature
/cook create a SwiftUI view with NavigationStack and product list

# 4. Add networking
/cook add async URLSession client for API calls

# 5. Test
/test
/git:cm
```

## Contributing

Contributions are welcome! The project is organized into phases:

| Phase | Component | Status |
|-------|-----------|--------|
| 1 | CLI Tool (`ck`) | Planned |
| 2 | AI Agents (5) | Planned |
| 3 | Commands (8) | Planned |
| 4 | Skills (11) | iOS skill created |
| 5 | Workflows & Config | Planned |

## License

MIT

## Credits

Created by Phuong Doan

## Support

- GitHub Issues: [claude-kit/issues](https://github.com/yourusername/claude-kit/issues)
- Documentation: [Full docs in `/docs`](./docs)
