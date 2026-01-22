# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeKit is an AI-powered development toolkit for Claude Code. It consists of:

1. **CLI Tool (`ck`)** - A Bun-based CLI that initializes projects with ClaudeKit
2. **Kit Templates** - Pre-configured `.claude/` folders containing agents, commands, skills, and workflows

## Architecture

```
claude-kit/
├── cli/              # CLI tool (Bun + TypeScript)
│   ├── bin/ck.ts     # Binary entry point
│   └── src/          # CLI implementation
│       ├── cli/      # CAC command configuration
│       ├── commands/  # ck init, ck new, version
│       ├── domains/   # installation, config, versioning
│       └── services/  # file-operations, path-resolver
│
└── kits/
    └── default/       # Default kit template
        └── .claude/   # Copied to new projects
            ├── agents/    # AI agent definitions (.md files)
            ├── commands/  # Slash commands (.md files)
            ├── skills/    # Domain expertise (.md files)
            ├── workflows/ # Agent orchestration (.md files)
            └── *.json     # Configuration files
```

### CLI vs Kits

- **`cli/`** - The `ck` command tool. Reads from `kits/` and installs to target projects.
- **`kits/default/`** - Template that gets copied. Contains all `.claude/` content.

When `ck new my-app` runs:
1. Reads `kits/default/.claude/`
2. Copies to `my-app/.claude/`
3. Creates metadata.json, README.md, .gitignore

## Development Commands

### CLI Development (work in `/cli` directory)

```bash
# Install dependencies
bun install

# Development
bun run dev              # Run CLI directly
bun run src/index.ts

# Build
bun run build           # Build to ./dist
bun run start           # Run built version

# Type checking
bun run lint            # TypeScript check (tsc --noEmit)

# Link CLI globally (enables 'ck' command)
bun link

# Tests
bun test
```

### Using the CLI

```bash
ck --version            # Show version
ck init [path]          # Initialize existing project
ck new [name]           # Create new project with git init
ck new [name] --force   # Force overwrite
```

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `CLAUDEKIT_PATH` | Path to kit directory | `./kits/default` |

## Key Implementation Details

### CLI Entry Points

- `/cli/bin/ck.ts` - Binary shebang to Bun
- `/cli/src/index.ts` - Main entry, calls CAC
- `/cli/src/cli/cli-config.ts` - Command registration with CAC

### Domain Services

| Domain | File | Purpose |
|--------|------|---------|
| installation | `src/domains/installation/index.ts` | Copy kit files to target |
| config | `src/domains/config/index.ts` | Read/write metadata.json |
| versioning | `src/domains/versioning/` | Version management |

### File Operations

- `src/services/file-operations/scanner.ts` - Directory scanning
- `src/services/file-operations/manifest.ts` - File hashing for manifests
- `src/services/path-resolver.ts` - Resolve `CLAUDEKIT_PATH`

### Types

Core types in `src/types/index.ts`:
- `KitMetadata` - Project metadata (cliVersion, kitPath, initializedAt)
- `ManifestEntry` - File path, size, hash
- `InitOptions`, `NewOptions` - Command options

## Kit Template Structure

### Agents (`kits/default/.claude/agents/*.md`)

Markdown files defining AI agent behavior. Frontmatter includes agent type and capabilities.

- **planner** - Spawns researchers, creates implementation plans
- **fullstack-developer** - Executes plans, writes code/tests
- **researcher** - Multi-source research, best practices
- **tester** - Test framework detection, coverage analysis
- **debugger** - Root cause analysis, fix suggestions

Additional iOS agents in `/cli/.claude/agents/`:
- ios-developer, ios-tester, ios-debugger

### Commands (`kits/default/.claude/commands/**/*.md`)

Slash commands with frontmatter defining title, description, agent.

**Core commands:**
- `/bootstrap` - Initialize new projects
- `/cook` - Implement features (primary dev command)
- `/plan` - Create implementation plans
- `/test` - Run tests
- `/debug` - Debug issues
- `/ask` - Query codebase

**Fix commands:** `/fix:fast`

**Git commands:** `/git:cm`

### Skills (`kits/default/.claude/skills/*/SKILL.md`)

Domain expertise activated by keywords/context.

- frontend-development - React, hooks, state management
- backend-development - Node.js, REST, validation
- ios-development - Swift 6, SwiftUI, UIKit
- nextjs - Next.js 15 App Router
- shadcn-ui - Radix UI + Tailwind
- better-auth - Authentication
- databases - Prisma, Drizzle, schema design
- docker - Dockerfiles, Compose
- planning - Requirements analysis
- research - Multi-source gathering
- debugging - Systematic methodology

### Workflows (`kits/default/.claude/workflows/*.md`)

Multi-agent orchestration patterns.

- feature-development - Plan → Cook → Test → Review → Commit
- bug-fixing - Debug → Fix → Test → Commit
- project-init - Bootstrap → Initial commit

### Configuration Files

- `metadata.json` - Kit version, installation tracking
- `settings.json` - Hooks, preferences
- `settings.local.json` - Local overrides (gitignored)

## TypeScript Configuration

`/cli/tsconfig.json`:
- Target: ESNext
- Module: ESNext with bundler resolution
- Strict mode enabled
- Path aliases: `@/` → `src/`

## Planning Documentation

`/docs/` contains implementation plans for each phase:
- `01-cli-tool.md` - CLI specification (~605 lines)
- `02-agents.md` - Agent specifications (~640 lines)
- `03-commands.md` - Command specifications (~720 lines)
- `04-skills.md` - Skill specifications (~1,480 lines)
- `05-workflows-config.md` - Workflow/config plans (~365 lines)

## Phase Status

| Phase | Component | Status |
|-------|-----------|--------|
| 1 | CLI Tool | Implemented |
| 2 | Agents | Partially (5 core + 3 iOS) |
| 3 | Commands | Partially (8 core) |
| 4 | Skills | Partially (11 core) |
| 5 | Workflows/Config | Partially (3 workflows + config) |

Planned additions:
- 12 more agents (code-reviewer, git-manager, scout, etc.)
- 58 more commands (fix:*, design:*, content:*, docs:*)
- 39 more skills (ui-styling, threejs, devops, mcp-builder, etc.)

## Testing ClaudeKit Changes

```bash
# 1. Link CLI
cd cli && bun link

# 2. Create test project
cd /tmp
ck new test-app

# 3. Verify structure
ls -la test-app/.claude/

# 4. Test in Claude Code (in test-app/)
/plan add user authentication
/cook plans/240122-auth.md
/test
/git:cm
```

## Important Notes

- Kit files are **copied**, not linked. Changes to `kits/default/` only affect new projects.
- CLI has its own `.claude/agents/` (iOS-specific) separate from the kit template.
- `CLAUDE.md` in project root is for **this repository**. `kits/default/CLAUDE.md` is a **template** for new projects.
- All command/agent/skill files use frontmatter for metadata.
