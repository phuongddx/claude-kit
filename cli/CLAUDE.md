# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeKit CLI is a Bun-based TypeScript CLI tool that manages `.claude/` kit installations for projects. This is the **CLI component** of the larger ClaudeKit project.

## Development Commands

```bash
# In /cli directory
bun install              # Install dependencies
bun run dev              # Run CLI directly (src/index.ts)
bun run build            # Build to ./dist
bun run start            # Run built version
bun run lint             # TypeScript type check (tsc --noEmit)
bun test                 # Run tests

# Global linking (enables 'ck' command everywhere)
bun link

# Using the CLI
ck --version
ck [path]                # Initialize existing project (alias: ck init)
ck new [name]            # Create new project with git init
ck update [path]         # Update with latest kit files
ck git:commit [path]     # Stage and commit changes (alias: git:cm)
ck git:push [path]       # Commit and push to remote (alias: git:cp)
ck git:pr [path]         # Create GitHub pull request
```

## High-Level Architecture

```
cli/
├── bin/ck.ts                 # Shebang entry point
├── src/
│   ├── cli/                  # CAC command registration (cli-config.ts)
│   ├── commands/             # Command implementations
│   ├── domains/              # Business logic modules
│   ├── services/             # Shared utilities
│   ├── shared/               # Constants, logger, git utilities
│   └── types/                # TypeScript types
├── test/                     # Bun test files
└── .claude/agents/           # CLI-specific AI agents
```

### Domain-Driven Architecture

The `/domains/` directory isolates business logic:
- `installation/` - Kit file copying logic
- `config/` - Metadata/settings.json management with Zod validation
- `updater/` - File syncing with preservation logic

### Path Resolution Pattern

Critical function: `resolveKitPath()` in `src/services/path-resolver.ts`

Kit location priority:
1. `CLAUDEKIT_PATH` environment variable (absolute or relative to CWD)
2. Default: `../../kits/default` (relative to CLI installation)

The function uses `getCliDir()` which derives the CLI location from `import.meta.url`, then navigates up to find the project root and kit directory.

### Command Metadata Discovery

The CLI reads command descriptions from `.md` files' YAML frontmatter via `src/services/command-metadata.ts`:

- Searches both project `.claude/` and kit template directories
- Parses frontmatter for: `title`, `description`, `agent`, `argumentHint`
- Formats descriptions with argument hints (👉👉👉 emoji)

### File Preservation Pattern

During updates, these files are never overwritten:
- `metadata.json` - Project installation metadata
- `settings.local.json` - Local configuration overrides

### Git Safety Patterns

Git commands (`src/shared/git.ts`, `src/commands/git-*.ts`) enforce:
- **Blocked patterns**: `.env`, secrets, `.pem`, `.key`, credentials
- **Protected branches**: main, master, release, production (require confirmation)
- **Force push**: uses `--force-with-lease`, requires explicit confirmation
- **Conventional commits**: type/scope format with interactive generation

## TypeScript Configuration

- Target: ESNext with bundler module resolution
- Strict mode enabled
- ES Modules with `.js` extensions required in imports
- Use `node:` prefix for Node.js built-ins

## Testing

Tests mirror source structure in `/test/`:
- `config.test.ts` - Metadata read/write/validate
- `path-resolver.test.ts` - Path resolution
- `scanner.test.ts` - File/directory existence checks
- `version.test.ts` - Version constants

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `CLAUDEKIT_PATH` | Override kit directory location | `./kits/default` (relative to project root) |

## CLI-Specific Agents

The `.claude/agents/` directory contains agent definitions for this CLI:
- `git-manager.md` - Git workflow automation (commit/push/PR)
- `debugger.md` - Root cause analysis
- `planner.md` - Implementation planning
- `researcher.md` - Research tasks
- `tester.md` - Testing framework detection
- `ios-developer.md` - Unified iOS development agent with XcodeBuildMCP integration

### iOS Development Architecture

The iOS agent has been unified from 3 separate agents into a single, comprehensive agent:

**Before:** 3 separate agents (ios-developer, ios-tester, ios-debugger)
**After:** 1 unified agent (ios-developer) with 3 specialized skills

The unified `ios-developer` agent:
- Handles all iOS development tasks (implementation, testing, debugging)
- Integrates with XcodeBuildMCP for autonomous Xcode operations (83 MCP tools)
- References specialized skills:
  - `skills/ios-development/development.md` - Core iOS patterns
  - `skills/ios-development/build.md` - Build systems and simulator management
  - `skills/ios-development/tester.md` - Testing strategies
- Works with or without XcodeBuildMCP (progressive enhancement)

These are separate from kit template agents.

## Dependencies

- `cac` - CLI framework
- `@clack/prompts` - Interactive CLI prompts
- `zod` - Schema validation
- Runtime: Bun (no external git library - uses Node.js `child_process`)
