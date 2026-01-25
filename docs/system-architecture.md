# System Architecture

## High-Level Overview

ClaudeKit is a monorepo containing a CLI tool and kit templates. The CLI reads kit files and installs them into target projects, enabling AI-powered development workflows through Claude Code.

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Workflow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User runs: ck new my-app                                    │
│     └──► CLI executes newCommand()                              │
│                                                                  │
│  2. CLI reads from kits/default/.claude/                        │
│     └──► Copies files to my-app/.claude/                        │
│                                                                  │
│  3. User opens Claude Code in my-app/                           │
│     └──► Claude reads .claude/ agents/commands/skills           │
│                                                                  │
│  4. User runs: /cook add authentication                         │
│     └──► Claude spawns fullstack-developer agent                │
│     └──► Agent reads command definition from commands/core/cook.md│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Modules

### CLI Module (`cli/`)

**Purpose**: Bun-based TypeScript CLI tool

**Key files**:
- `bin/ck.ts` - Executable shebang entry
- `src/index.ts` - Main entry point
- `src/cli/cli-config.ts` - CAC command registration
- `src/commands/` - Command implementations

**Dependencies**:
- `cac` - CLI framework
- `@clack/prompts` - Interactive prompts
- `zod` - Schema validation

**Responsibilities**:
1. Parse command-line arguments
2. Resolve kit and project paths
3. Copy/sync kit files
4. Manage metadata.json
5. Execute git workflows

### Installation Domain (`cli/src/domains/installation/`)

**Purpose**: Copy kit files to target projects

**Key files**:
- `index.ts` - Public API
- `file-copier.ts` - File copying logic

**Functions**:
```typescript
export async function installKit(
  projectRoot: string,
  options: InstallOptions = {}
): Promise<InstallResult>
```

**Process**:
1. Read kit directory structure
2. Filter out excluded files (node_modules, etc.)
3. Create target directories
4. Copy files recursively
5. Write metadata.json

### Config Domain (`cli/src/domains/config/`)

**Purpose**: Manage metadata and settings

**Key files**:
- `index.ts` - Read/write operations
- `schema.ts` - Zod validation schemas

**Functions**:
```typescript
readMetadata(projectRoot: string): Promise<KitMetadata | null>
writeMetadata(projectRoot: string, metadata: KitMetadata): Promise<void>
readSettings(projectRoot: string): Promise<Settings | null>
validateMetadata(data: unknown): Promise<KitMetadata>
```

**Validation**:
- Uses Zod for schema validation
- Ensures metadata.json integrity
- Provides type safety

### Updater Domain (`cli/src/domains/updater/`)

**Purpose**: Sync kit files while preserving local changes

**Key files**:
- `index.ts` - Public API
- `file-syncer.ts` - Sync logic
- `preserve-list.ts` - Files to never overwrite

**Preserved Files**:
- `metadata.json` - Project installation metadata
- `settings.local.json` - Local overrides

**Process**:
1. Scan current project files
2. Compare with kit files
3. Identify new/updated/deleted files
4. Sync with preservation rules

### Path Resolver Service (`cli/src/services/path-resolver.ts`)

**Purpose**: Resolve kit and project paths

**Key functions**:
```typescript
resolveKitPath(): string  // CLAUDEKIT_PATH or default
resolveProjectRoot(): string  // Current git repo or CWD
getCliDir(): string  // CLI installation directory
```

**Resolution Priority**:
1. `CLAUDEKIT_PATH` environment variable (absolute or relative)
2. Default: `../../kits/default` from CLI installation

### Command Metadata Service (`cli/src/services/command-metadata.ts`)

**Purpose**: Parse command descriptions from markdown frontmatter

**Functions**:
```typescript
findCommandFile(commandName: string, kitPath: string, projectRoot: string): string | null
getCommandMetadata(filePath: string): CommandMetadata | null
formatCommandDescription(metadata: CommandMetadata): string
```

**Frontmatter Schema**:
```yaml
---
title: Cook Command
description: 👉👉👉 - Implement features
agent: fullstack-developer
argument-hint: 👉👉👉 [feature or plan.md]
---
```

### Git Utilities (`cli/src/shared/git.ts`)

**Purpose**: Git workflow automation

**Functions**:
```typescript
gitStatus(cwd: string): Promise<GitStatus>
gitAdd(cwd: string, files: string[]): Promise<void>
gitCommit(cwd: string, message: string, options: CommitOptions): Promise<void>
gitPush(cwd: string, options: PushOptions): Promise<void>
gitCreatePr(cwd: string, options: PrOptions): Promise<void>
```

**Safety Features**:
- Blocks secrets (`.env`, `.pem`, `.key`)
- Protects main/master branches
- Uses `--force-with-lease` for pushes
- Conventional commit format

## Data Flow

### Project Initialization Flow

```
User: ck new my-app
    ↓
cli-config.ts: newCommand(name)
    ↓
commands/new.ts
    ├─→ Create project directory
    ├─→ Initialize git repository
    ├─→ domains/installation/index.ts
    │   ├─→ resolveKitPath()
    │   ├─→ Read kit files
    │   └─→ Copy to my-app/.claude/
    ├─→ domains/config/index.ts
    │   ├─→ Create metadata.json
    │   └─→ Create settings.json
    └─→ Create README.md, .gitignore
    ↓
Success: Project initialized
```

### Project Update Flow

```
User: ck update
    ↓
cli-config.ts: updateCommand(path)
    ↓
commands/update.ts
    ├─→ domains/config/index.ts: readMetadata()
    ├─→ domains/updater/index.ts
    │   ├─→ file-syncer.ts: scanCurrentFiles()
    │   ├─→ file-syncer.ts: scanKitFiles()
    │   ├─→ Compare and identify changes
    │   ├─→ preserve-list.ts: checkPreservedFiles()
    │   └─→ Sync with preservation
    └─→ domains/config/index.ts: updateMetadata()
    ↓
Success: Kit files updated
```

### Git Commit Flow

```
User: ck git:commit
    ↓
cli-config.ts: gitCmCommand(path, options)
    ↓
commands/git-commit.ts
    ├─→ shared/git.ts: gitStatus()
    ├─→ Analyze changes with git diff
    ├─→ Categorize by type (feat/fix/docs/etc.)
    ├─→ Generate conventional commit message
    ├─→ shared/git.ts: gitAdd() (stage files)
    ├─→ shared/git.ts: gitCommit() (create commit)
    └─→ Run hooks if enabled
    ↓
Success: Commit created
```

## Key Patterns

### 1. Domain-Driven Design

Business logic isolated in `/domains/`:
- `installation/` - File operations
- `config/` - Configuration management
- `updater/` - Update logic

### 2. Service Layer

Reusable utilities in `/services/`:
- Path resolution
- File operations
- Command metadata parsing

### 3. Command Pattern

Each CLI command is a pure function:
```typescript
export async function commandName(
  arg: string,
  options: Options = {}
): Promise<void>
```

### 4. Metadata Discovery

Commands read their own descriptions from markdown files:
1. Find command file in `.claude/commands/`
2. Parse YAML frontmatter
3. Display description with argument hint

### 5. Preservation Strategy

Updates preserve local customizations:
- `metadata.json` - Never overwrite
- `settings.local.json` - Gitignored, never touched
- Other files - Synced with kit

### 6. Safety First

Git commands enforce safety:
- Secret detection (block `.env`, credentials)
- Protected branches (main, master, production)
- Safe force push (`--force-with-lease`)
- Conventional commits (structured messages)

## Integration Points

### Claude Code Integration

1. **Kit Installation**: CLI installs `.claude/` folder
2. **Agent Discovery**: Claude reads `.claude/agents/*.md`
3. **Command Invocation**: User types `/cook`, Claude reads command definition
4. **Skill Activation**: Context-based skill loading

### File System

- **Read**: Kit templates, project files
- **Write**: Project initialization, updates
- **Preserve**: Local customizations during updates

### Git

- **Initialize**: `ck new` runs `git init`
- **Commit**: `ck git:commit` creates conventional commits
- **Push**: `ck git:push` pushes to remote
- **PR**: `ck git:pr` creates GitHub pull requests

## Technology Decisions

| Technology | Rationale |
|------------|-----------|
| **Bun** | Fast runtime, native TypeScript, built-in test runner |
| **CAC** | Lightweight CLI framework, intuitive API |
| **Zod** | Runtime type validation, excellent TypeScript support |
| **Markdown** | Human-readable command/agent definitions |
| **Git** | Version control, integrates with Claude Code workflows |
| **ES Modules** | Modern JavaScript, tree-shaking support |
