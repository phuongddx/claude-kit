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
bun test                # Run all tests (52 tests passing)
bun test unit           # Unit tests only
bun test integration    # Integration tests only
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
| `CLAUDEKIT_AGENT_STYLE` | Agent signature style | `text` |
| `NO_COLOR` | Disable all colors | `false` |

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
| updater | `src/domains/updater/` | Update mechanism with version tracking |
| versioning | `src/domains/versioning/` | Version tracking, rollback, history |

### Core Services

| Service | File | Purpose |
|---------|------|---------|
| Agent Registry | `src/services/agent-registry.ts` | Discover and manage agents |
| Agent Coordinator | `src/services/agent-coordinator.ts` | Orchestrate multi-agent workflows |
| Skill Indexer | `src/services/skill-indexer.ts` | Discover all available skills |
| Skill Activator | `src/services/skill-activator.ts` | Context-aware skill loading |
| Command Registry | `src/cli/command-registry.ts` | Dynamic command discovery |
| Command Metadata | `src/services/command-metadata.ts` | Read command frontmatter |
| Merge Resolver | `src/services/merge-resolver.ts` | Three-way merge conflict resolution |
| Preserve List | `src/domains/updater/preserve-list.ts` | Pattern-based file preservation |

### File Operations

- `src/services/file-operations/scanner.ts` - Directory scanning
- `src/services/file-operations/manifest.ts` - File hashing for manifests
- `src/services/path-resolver.ts` - Resolve `CLAUDEKIT_PATH`

### Error Handling

- `src/errors/base.ts` - Structured error base classes
- `src/errors/codes.ts` - Error code definitions
- `src/errors/handlers.ts` - Error handlers with suggestions

### Types

Core types in `src/types/index.ts`:
- `KitMetadata` - Project metadata (cliVersion, kitPath, initializedAt, updateHistory)
- `ManifestEntry` - File path, size, hash
- `PreserveRule` - File preservation rules (exact, glob, directory)
- `MergeConflict` - Merge conflict detection and resolution
- `AgentDefinition` - Agent metadata and capabilities
- `SkillDefinition` - Skill metadata and dependencies
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

- `metadata.json` - Kit version, installation tracking, update history
- `settings.json` - Hooks, preferences
- `settings.local.json` - Local overrides (gitignored)

## Agent Signatures

ClaudeKit agents include visual signatures to identify when a ClaudeKit agent is active. This helps distinguish ClaudeKit agents from other AI agents.

### Signature Format

Each agent outputs a signature footer at completion:

```markdown
---
*[agent-name] is a ClaudeKit agent*
```

Example outputs:
- `[planner]` - Planning agent
- `[developer]` - Implementation agent
- `[researcher]` - Research agent
- `[tester]` - Testing agent
- `[debugger]` - Debugging agent
- `[reviewer]` - Code review agent
- `[git]` - Git operations agent
- `[docs]` - Documentation agent
- `[design]` - UI/UX design agent
- `[perf]` - Performance analysis agent
- `[ios]` - iOS development agent

### Signature Styles

The `CLAUDEKIT_AGENT_STYLE` environment variable controls signature appearance:

| Style | Output Example | Description |
|-------|----------------|-------------|
| `text` (default) | `[planner] Creating plan...` | Text prefix only |
| `emoji` | `🧠 planner: Creating plan...` | Text + emoji badge |
| `color` | `[planner]` (colored) | Text with ANSI color |
| `full` | `🧠 [planner]` (colored) | Emoji + colored text |

### Configuration

```bash
# Set signature style
export CLAUDEKIT_AGENT_STYLE=emoji

# Disable all colors
export NO_COLOR=1
```

### Implementation

- Utility: `cli/src/utils/agent-signature.ts`
- Types: `cli/src/types/index.ts` (AgentSignatureConfig, FormatOptions)
- Tests: `cli/src/utils/__tests__/agent-signature.test.ts`

## Update Mechanism

ClaudeKit supports updating existing projects with new kit files while preserving local customizations.

### Update Features

- **Version Tracking** - SHA256 file hashing for change detection
- **Rollback** - Automatic backups before updates with one-step rollback
- **Three-Way Merge** - Intelligent conflict resolution between kit, local, and base versions
- **Dry-Run Mode** - Preview changes before applying them
- **Preserve Rules** - Pattern-based file protection (exact, glob, directory)

### Update Process

```bash
# Preview update (dry-run)
ck update . --dry-run

# Apply update
ck update .

# Rollback if needed
ck update . --rollback
```

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
| 2 | Agents | Implemented (9 core + 3 iOS) |
| 3 | Commands | Implemented (15 core) |
| 4 | Skills | Implemented (11 core) |
| 5 | Workflows/Config | Implemented (3 workflows + config) |

### Implemented Agents

**Core agents (in kits/default/.claude/agents/):**
- planner - Spawns researchers, creates implementation plans
- fullstack-developer - Executes plans, writes code/tests
- researcher - Multi-source research, best practices
- tester - Test framework detection, coverage analysis
- debugger - Root cause analysis, fix suggestions
- **docs-manager** - Documentation generation and updates
- **project-manager** - Project structure and organization
- **ui-designer** - UI/UX design and component architecture
- **performance-analyst** - Performance profiling and optimization

**iOS agents (in cli/.claude/agents/):**
- ios-developer, ios-tester, ios-debugger

## Axiom iOS Skills Integration

ClaudeKit integrates with external [Axiom](https://github.com/CharlesWiltgen/Axiom) skills for specialized iOS development.

### UIKit Animation Debugging

The ios-developer agent references `axiom-uikit-animation-debugging` for:
- CAAnimation completion handler issues (handlers not firing, timing problems)
- Animation duration mismatches (declared vs actual duration)
- Spring physics differences between simulator and device
- Gesture + animation synchronization causing jank
- Device-specific animation behavior

**Installation:**
```bash
/plugin install axiom@claude-code-plugins-plus
```

**Usage:**
When debugging CAAnimation issues, the ios-developer agent automatically invokes the Axiom skill. No manual configuration required.

**Documentation:** [Axiom UIKit Animation Debugging](https://github.com/CharlesWiltgen/Axiom/blob/main/.claude-plugin/plugins/axiom/skills/axiom-uikit-animation-debugging/SKILL.md)

### Implemented Commands

**Core commands:**
- `/bootstrap` - Initialize new projects
- `/cook` - Implement features (primary dev command)
- `/plan` - Create implementation plans
- `/test` - Run tests
- `/debug` - Debug issues
- `/ask` - Query codebase

**Fix commands:**
- `/fix:fast` - Quick fixes for simple bugs
- `/fix:hard` - Complex bug fixes requiring investigation
- `/fix:ci` - Fix CI/CD pipeline failures
- `/fix:test` - Fix failing tests
- `/fix:ui` - Fix UI bugs and visual issues

**Design commands:**
- `/design:fast` - Quick UI design implementation

**Docs commands:**
- `/docs:update` - Update existing documentation

**Git commands:**
- `/git:cm` - Stage and commit with conventional commits

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

## Development Workflow

### Editing Agents, Commands, Skills

This project uses its own toolkit for development ("dogfooding"). The root `.claude/` is an installed instance created via `ck init .`.

**Architecture:**
```
claude-kit/
├── .claude/                    # Root installed instance (for dogfooding)
│   └── metadata.json           # Tracks as installed instance
│
├── cli/.claude/                # CLI installed instance (for CLI development)
│   └── metadata.json           # Tracks as installed instance
│   └── agents/
│       └── ios-developer.md    # CLI-specific agent (NOT in template)
│
└── kits/default/               # Kit template (SOURCE OF TRUTH)
    └── .claude/
```

**Workflow:**
1. Edit files in `kits/default/.claude/` (template/source of truth)
2. Run `./scripts/sync-kit.sh` to sync changes to both root and CLI
3. Test changes work
4. Commit all three locations (template, root, CLI)

### CLI-Specific Workflow

The CLI directory has its own `.claude/agents/` for dogfooding:

**CLI-unique agents:**
- `ios-developer.md` - iOS development (not in kit template, manually managed)

**Shared agents (synced from template):**
- All other agents in `cli/.claude/agents/` are synced from `kits/default/.claude/agents/`

**Sync CLI agents only:**
```bash
cd cli && CLAUDEKIT_PATH=/Users/ddphuong/Projects/claude-kit/kits/default ck update .
```

**Add a new CLI-specific agent:**
1. Create agent file in `cli/.claude/agents/[name].md`
2. DO NOT add to kit template (CLI-specific only)

**Why multiple copies?**
- `kits/default/.claude/` = Template (what gets copied to new projects)
- `.claude/` = Root installed instance (what this project uses)
- `cli/.claude/` = CLI installed instance (what CLI uses for development)
- Enables real-world testing of the toolkit

## Important Notes

- Kit files are **copied**, not linked. Changes to `kits/default/` only affect new projects.
- CLI has its own `.claude/agents/` (iOS-specific) separate from the kit template.
- `CLAUDE.md` in project root is for **this repository**. `kits/default/CLAUDE.md` is a **template** for new projects.
- All command/agent/skill files use frontmatter for metadata.
