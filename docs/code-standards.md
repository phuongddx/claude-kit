# Code Standards

## Naming Conventions

### Files
- **TypeScript**: `kebab-case.ts` (e.g., `path-resolver.ts`, `cli-config.ts`)
- **Tests**: Mirror source with `.test.ts` suffix (e.g., `config.test.ts`)
- **Markdown**: `kebab-case.md` (e.g., `feature-development.md`)
- **Directories**: `kebab-case` (e.g., `file-operations`, `installation`)

### Variables
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `CLI_NAME`, `CLI_VERSION`)
- **Functions/Methods**: `camelCase` (e.g., `resolveKitPath`, `createCli`)
- **Interfaces**: `PascalCase` with `I` prefix avoided (e.g., `KitMetadata`, `GitStatus`)
- **Types**: `PascalCase` (e.g., `InitOptions`, `FileChange`)

### Commands
- **CLI commands**: `kebab-case` (e.g., `git:commit`, `git:cm`)
- **Slash commands**: `category:action` format (e.g., `/core:cook`, `/fix:fast`)

## Code Patterns Found

### 1. Domain Module Pattern

Each domain in `/domains/` exports an `index.ts` with related functions:

```typescript
// domains/config/index.ts
export async function readMetadata(projectRoot: string): Promise<KitMetadata | null> { }
export async function writeMetadata(projectRoot: string, metadata: KitMetadata): Promise<void> { }
export async function validateMetadata(data: unknown): Promise<KitMetadata> { }
```

### 2. Service Layer Pattern

Shared utilities in `/services/`:

```typescript
// services/path-resolver.ts
export function resolveKitPath(): string { }
export function resolveProjectRoot(): string { }
```

### 3. Command Implementation Pattern

All commands follow this structure:

```typescript
// commands/new.ts
import type { NewOptions } from '../types/index.js';

export async function newCommand(name: string, options: NewOptions = {}) {
  // 1. Validate input
  // 2. Call domain functions
  // 3. Handle errors
  // 4. Log output
}
```

### 4. Path Alias Pattern

TypeScript path aliases in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 5. ES Module Pattern

All imports use `.js` extensions (TypeScript requirement for ESNext):
```typescript
import { CLI_NAME } from '../shared/constants.js';
import type { KitMetadata } from '../types/index.js';
```

### 6. Zod Validation Pattern

Schema validation for configuration:

```typescript
// domains/config/schema.ts
import { z } from 'zod';

export const KitMetadataSchema = z.object({
  cliVersion: z.string(),
  kitPath: z.string(),
  initializedAt: z.string(),
});

export type KitMetadata = z.infer<typeof KitMetadataSchema>;
```

### 7. Error Handling Pattern

Consistent error handling across domains:

```typescript
try {
  const metadata = await readMetadata(projectRoot);
  if (!metadata) {
    throw new Error('No metadata found');
  }
  // Process metadata
} catch (error) {
  if (error instanceof Error) {
    logger.error(`Failed: ${error.message}`);
  }
  throw error;
}
```

### 8. CLI Configuration Pattern

CAC command registration with metadata discovery:

```typescript
// cli/cli-config.ts
cli.command('new [name]', getCommandDescription('new', 'Create a new project'))
  .option('-f, --force', 'Force overwrite existing files')
  .action(async (name: string, options: { force?: boolean }) => {
    await newCommand(name, options);
  });
```

## Linting/Formatting

| Tool | Purpose | Config Location |
|------|---------|-----------------|
| **TypeScript** | Type checking | `cli/tsconfig.json` |
| **Bun** | Runtime & test | Built-in |

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Testing Approach

### Framework
- **Bun test** - Built-in test runner

### Test Structure

Tests mirror source structure in `/test/`:
```
cli/
├── src/
│   └── domains/
│       └── config/
└── test/
    └── config.test.ts
```

### Test Patterns

```typescript
// test/config.test.ts
import { describe, test, expect } from 'bun:test';

describe('Config', () => {
  test('readMetadata parses valid metadata.json', async () => {
    // Arrange
    const projectRoot = '/fake/path';
    // Act
    const result = await readMetadata(projectRoot);
    // Assert
    expect(result).toEqual({ /* ... */ });
  });
});
```

## Git Conventions

### Commit Message Format

Conventional commits with type/scope:
```
type(scope): description

feat(commands): add git:commit command
fix(updater): preserve local settings during update
docs(readme): update installation instructions
test(config): add metadata validation tests
```

### Commit Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Build, config, dependencies |

## Import Organization

```typescript
// 1. Node.js built-ins (with node: prefix)
import path from 'node:path';

// 2. External dependencies
import cac from 'cac';
import { z } from 'zod';

// 3. Internal imports (relative)
import { CLI_NAME } from '../shared/constants.js';
import type { KitMetadata } from '../types/index.js';
```

## Documentation Standards

### Markdown Files

- Use ATX-style headings (`# Header`, `## Subheader`)
- Code blocks with language tags
- Tables for structured data
- Links with descriptive text

### Frontmatter Pattern

All `.claude/` markdown files use YAML frontmatter:

```yaml
---
title: Command Title
description: Brief description
agent: agent-name
argument-hint: [hint text]
---
```

## Constants Pattern

Centralized constants in `src/shared/constants.ts`:

```typescript
export const CLI_NAME = 'ck';
export const CLI_VERSION = '1.0.0';
export const METADATA_FILE = 'metadata.json';
export const SETTINGS_FILE = 'settings.json';
```
