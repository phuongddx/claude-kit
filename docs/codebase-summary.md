# Codebase Summary

## Project Overview

ClaudeKit is an AI-powered development toolkit for Claude Code. It provides a CLI tool (`ck`) that initializes projects with pre-configured AI development kits containing agents, commands, skills, and workflows. The toolkit accelerates development by providing intelligent automation and domain expertise.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **CLI Runtime** | Bun |
| **Language** | TypeScript 5.3+ |
| **CLI Framework** | CAC |
| **Validation** | Zod |
| **Package Manager** | Bun |
| **Version Control** | Git |
| **Testing** | Bun test |

## Directory Structure

```
claude-kit/
├── cli/                      # CLI tool implementation
│   ├── bin/ck.ts            # Executable entry point (shebang)
│   ├── src/
│   │   ├── cli/             # CAC command registration
│   │   ├── commands/        # Command implementations (init, new, update, git-*)
│   │   ├── domains/         # Business logic modules
│   │   │   ├── installation/ # Kit file copying
│   │   │   ├── config/       # Metadata/settings management
│   │   │   └── updater/      # File syncing with preservation
│   │   ├── services/        # Shared utilities
│   │   │   ├── file-operations/ # Scanner, manifest
│   │   │   ├── path-resolver.ts   # Kit/project path resolution
│   │   │   └── command-metadata.ts # Frontmatter parser
│   │   ├── shared/          # Constants, logger, git utilities
│   │   ├── types/           # TypeScript type definitions
│   │   └── index.ts         # Main entry point
│   ├── test/                # Mirror of src/ for tests
│   ├── package.json
│   ├── tsconfig.json
│   └── .claude/agents/      # CLI-specific AI agents
│
├── kits/
│   └── default/             # Default kit template
│       └── .claude/
│           ├── agents/      # AI agent definitions (.md)
│           ├── commands/    # Slash commands (.md)
│           ├── skills/      # Domain expertise (.md)
│           ├── workflows/   # Agent orchestration (.md)
│           ├── metadata.json
│           ├── settings.json
│           └── settings.local.json
│
├── docs/                    # Generated documentation
├── CLAUDE.md                # Project instructions for Claude Code
└── README.md
```

## Key Files

| File | Purpose |
|------|---------|
| `cli/bin/ck.ts` | Executable shebang entry point |
| `cli/src/index.ts` | Main entry, calls CAC CLI |
| `cli/src/cli/cli-config.ts` | Command registration with CAC |
| `cli/src/services/path-resolver.ts` | Resolves CLAUDEKIT_PATH and project roots |
| `cli/src/domains/installation/index.ts` | Copies kit files to target projects |
| `cli/src/domains/config/index.ts` | Reads/writes metadata.json with Zod |
| `cli/src/shared/git.ts` | Git utilities for commit/push/PR commands |
| `kits/default/.claude/metadata.json` | Kit version and installation tracking |
| `CLAUDE.md` | Project-level instructions for Claude Code |

## Getting Started

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/claude-kit.git
cd claude-kit

# Install CLI dependencies
cd cli
bun install

# Link CLI globally
bun link
```

### Development

```bash
# In cli/ directory
bun run dev              # Run CLI directly from source
bun run build            # Build to ./dist
bun run start            # Run built version
bun run lint             # TypeScript type checking
bun test                 # Run tests
```

### CLI Usage

```bash
ck --version             # Show CLI version
ck [path]                # Initialize existing project
ck init [path]           # Initialize existing project (alias)
ck new [name]            # Create new project with git init
ck update [path]         # Update with latest kit files

# Git workflow commands
ck git:commit [path]     # Stage and commit (alias: git:cm)
ck git:push [path]       # Commit and push (alias: git:cp)
ck git:pr [path]         # Create GitHub pull request
```

## Project Components

### 1. CLI Tool (`cli/`)
Bun-based TypeScript CLI that manages kit installations. Handles:
- Project initialization (`ck init`, `ck new`)
- Kit updates (`ck update`)
- Git workflow automation (`ck git:*`)
- Command metadata discovery from markdown frontmatter

### 2. Kit Template (`kits/default/.claude/`)
Template copied to new projects containing:
- **Agents**: AI agent definitions (planner, fullstack-developer, researcher, tester, debugger)
- **Commands**: Slash commands (/cook, /plan, /test, /debug, /ask, /fix:fast, /git:*)
- **Skills**: Domain expertise (frontend, backend, iOS, Next.js, shadcn-ui, databases, etc.)
- **Workflows**: Multi-agent orchestration patterns
- **Config**: metadata.json, settings.json

### 3. Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `CLAUDEKIT_PATH` | Override kit directory location | `./kits/default` (relative to project root) |

## Architecture Patterns

### Domain-Driven Design
The `/domains/` directory isolates business logic:
- `installation/` - Kit file copying logic
- `config/` - Metadata management with Zod validation
- `updater/` - File syncing with local preservation

### Path Resolution
`resolveKitPath()` in `src/services/path-resolver.ts`:
1. Checks `CLAUDEKIT_PATH` environment variable
2. Falls back to `../../kits/default` relative to CLI installation
3. Uses `import.meta.url` to derive CLI location

### Command Metadata
Commands are defined as markdown files with YAML frontmatter:
```yaml
---
title: Cook Command
description: 👉👉👉 - Implement features
agent: fullstack-developer
argument-hint: 👉👉👉 [feature or plan.md]
---
```

### File Preservation
During `ck update`, these files are never overwritten:
- `metadata.json` - Project installation metadata
- `settings.local.json` - Local configuration overrides

## Related Files

- `README.md` - User-facing documentation
- `CHANGELOG.md` - Version history
- `CLAUDE.md` - Project instructions for Claude Code
