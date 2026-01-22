# Phase 1: CLI Tool (`ck`) Implementation

## Overview
Build the ClaudeKit CLI tool that initializes projects with AI development kits.

## Tech Stack
- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **CLI Framework**: CAC (Command And Conquer)
- **Prompts**: @clack/prompts

## Project Structure
```
cli/
├── package.json
├── tsconfig.json
├── bun.lockb
├── src/
│   ├── index.ts              # CLI entry point
│   ├── cli/
│   │   ├── cli-config.ts     # CAC configuration
│   │   └── command-registry.ts
│   ├── commands/
│   │   ├── init.ts           # ck init command
│   │   ├── new.ts            # ck new command
│   │   └── version.ts        # Version display
│   ├── domains/
│   │   ├── config/
│   │   │   ├── index.ts      # Settings management
│   │   │   └── schema.ts     # Zod validation schemas
│   │   ├── installation/
│   │   │   ├── index.ts      # Installation orchestrator
│   │   │   └── file-copier.ts # Kit file copying
│   │   └── versioning/
│   │       └── index.ts      # Version handling
│   ├── services/
│   │   ├── file-operations/
│   │   │   ├── scanner.ts    # Directory scanning
│   │   │   └── manifest.ts   # File manifest
│   │   └── path-resolver.ts  # Path utilities
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── shared/
│       ├── logger.ts         # Logging utilities
│       └── constants.ts      # Constants
└── bin/
    └── ck.ts                 # Binary entry point
```

## Commands

### `ck init [path]`
Initialize an existing project with ClaudeKit.

```typescript
// src/commands/init.ts
export async function initCommand(targetPath: string) {
  // 1. Check if target exists
  // 2. Check if already initialized
  // 3. Get kit path (env var or default)
  // 4. Copy .claude/ from kit to target
  // 5. Create metadata.json
}
```

### `ck new [name]`
Create a new project with ClaudeKit.

```typescript
// src/commands/new.ts
export async function newCommand(projectName: string) {
  // 1. Create project directory
  // 2. Initialize git repo
  // 3. Copy kit to .claude/
  // 4. Create basic files (README, .gitignore)
}
```

### `ck --version`
Display CLI version.

## Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDEKIT_PATH` | Path to kit directory | `./kits/default` |

### package.json
```json
{
  "name": "claudekit-cli",
  "version": "1.0.0",
  "description": "ClaudeKit CLI Tool",
  "type": "module",
  "bin": {
    "ck": "./bin/ck.ts"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir ./dist",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cac": "^6.7.14",
    "@clack/prompts": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

## Implementation Steps

1. **Initialize project**
   ```bash
   cd /Users/ddphuong/Projects/claude-kit
   mkdir -p cli
   cd cli
   bun init -y
   bun add cac @clack/prompts
   bun add -d @types/node typescript
   ```

2. **Create TypeScript config**
   ```json
   {
     "compilerOptions": {
       "target": "ESNext",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```

3. **Implement core files**
   - `src/index.ts` - Entry point with CAC setup
   - `src/cli/cli-config.ts` - Command registration
   - `src/commands/init.ts` - Init logic
   - `src/commands/new.ts` - New project logic
   - `src/domains/installation/index.ts` - Installation service

4. **Test CLI**
   ```bash
   bun link
   ck --version
   ck --help
   ```

## Verification

```bash
# Test init
cd /tmp && mkdir test-project && cd test-project
ck init .
ls -la .claude/

# Test new
ck new another-project
cd another-project
ls -la .claude/
```

## Files to Create

| File | Lines Estimate | Priority |
|------|---------------|----------|
| `package.json` | 20 | P0 |
| `tsconfig.json` | 15 | P0 |
| `src/index.ts` | 10 | P0 |
| `src/cli/cli-config.ts` | 50 | P0 |
| `src/commands/init.ts` | 80 | P0 |
| `src/commands/new.ts` | 60 | P0 |
| `src/commands/version.ts` | 10 | P0 |
| `src/domains/installation/index.ts` | 100 | P0 |
| `src/domains/config/index.ts` | 80 | P0 |
| `src/services/file-operations/scanner.ts` | 50 | P1 |
| `src/services/path-resolver.ts` | 40 | P1 |
| `src/shared/logger.ts` | 30 | P1 |
| `src/shared/constants.ts` | 20 | P1 |
| `src/types/index.ts` | 30 | P1 |
| `bin/ck.ts` | 10 | P0 |

**Total**: ~605 lines across 15 files
