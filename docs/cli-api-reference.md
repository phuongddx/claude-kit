# CLI API Reference

## Commands Reference

### `ck new [name]`

Create a new project with ClaudeKit initialized.

```bash
ck new my-app
ck new my-app --force
```

**Options**:
- `-f, --force` - Force overwrite existing files

**Creates**:
- Project directory
- Git repository (`git init`)
- `.claude/` folder with agents, commands, skills
- `README.md`, `.gitignore`
- `metadata.json`, `settings.json`

---

### `ck init [path]`

Initialize an existing project with ClaudeKit.

```bash
ck init .
ck init /path/to/project
```

**Adds**:
- `.claude/` folder to existing project
- Does not modify existing files

---

### `ck update [path]`

Update an existing project with the latest kit files.

```bash
ck update .
ck update /path/to/project
```

**Preserves**:
- `metadata.json` - Project installation metadata
- `settings.local.json` - Local overrides

**Syncs**:
- Command definitions
- Agent configurations
- Skill files
- Workflow templates

---

### `ck git:commit [path]` / `ck git:cm`

Stage and commit changes with conventional commits.

```bash
ck git:commit
ck git:commit . -m "feat: add new feature"
ck git:commit . -a --no-verify
```

**Options**:
- `-m, --message <msg>` - Custom commit message
- `-a, --all` - Stage all modified files
- `--no-verify` - Skip pre-commit hooks

**Process**:
1. Analyzes changes with `git status` and `git diff`
2. Categorizes changes (feat, fix, refactor, docs, test, chore)
3. Generates conventional commit message
4. Stages relevant files
5. Creates commit
6. Runs hooks if enabled

---

### `ck git:push [path]` / `ck git:cp`

Commit changes and push to remote.

```bash
ck git:push
ck git:push . -m "feat: add feature" --force
```

**Options**:
- `-m, --message <msg>` - Commit message
- `-a, --all` - Stage all modified files
- `-f, --force` - Force push (requires confirmation)
- `--no-verify` - Skip hooks

**Safety**:
- Uses `--force-with-lease` for force pushes
- Confirms force push action
- Blocks protected branches (main, master, production)

---

### `ck git:pr [path]`

Create GitHub pull request from current branch.

```bash
ck git:pr
ck git:pr . --base develop --draft
ck git:pr . --title "Feature: Add authentication"
```

**Options**:
- `--base <branch>` - Base branch (default: main)
- `--draft` - Create as draft PR
- `--title <title>` - Custom PR title

**Creates**:
- Pull request on GitHub
- Automatic title and body from commits

---

### `ck --version`

Display the current version of ClaudeKit CLI.

```bash
ck --version
# Output: 1.0.0
```

## Domain APIs

### Installation Domain

```typescript
import { installKit } from './domains/installation/index.js';

await installKit(projectRoot, options);
```

**Options**:
```typescript
interface InstallOptions {
  force?: boolean;
  exclude?: string[];
}
```

**Returns**:
```typescript
interface InstallResult {
  filesCopied: number;
  directoriesCreated: number;
  metadata: KitMetadata;
}
```

---

### Config Domain

```typescript
import {
  readMetadata,
  writeMetadata,
  validateMetadata
} from './domains/config/index.js';

// Read metadata
const metadata = await readMetadata(projectRoot);

// Write metadata
await writeMetadata(projectRoot, {
  cliVersion: '1.0.0',
  kitPath: '/path/to/kit',
  initializedAt: new Date().toISOString()
});

// Validate with Zod
const valid = await validateMetadata(data);
```

---

### Updater Domain

```typescript
import { updateKit } from './domains/updater/index.js';

await updateKit(projectRoot, options);
```

**Options**:
```typescript
interface UpdateOptions {
  force?: boolean;
  dryRun?: boolean;
}
```

**Returns**:
```typescript
interface UpdateResult {
  filesAdded: string[];
  filesUpdated: string[];
  filesRemoved: string[];
  filesPreserved: string[];
}
```

## Service APIs

### Path Resolver

```typescript
import {
  resolveKitPath,
  resolveProjectRoot,
  getCliDir
} from './services/path-resolver.js';

const kitPath = resolveKitPath();      // CLAUDEKIT_PATH or default
const projectRoot = resolveProjectRoot(); // Git repo or CWD
const cliDir = getCliDir();            // CLI installation directory
```

---

### Command Metadata

```typescript
import {
  findCommandFile,
  getCommandMetadata,
  formatCommandDescription
} from './services/command-metadata.js';

// Find command file
const file = findCommandFile('init', kitPath, projectRoot);

// Get metadata from frontmatter
const metadata = getCommandMetadata(file);
// Returns: { title, description, agent, argumentHint }

// Format description with hint
const description = formatCommandDescription(metadata);
// Returns: "👉👉👉 - Implement features"
```

---

### Git Utilities

```typescript
import {
  gitStatus,
  gitAdd,
  gitCommit,
  gitPush,
  gitCreatePr,
  getCurrentBranch
} from './shared/git.js';

// Get git status
const status = await gitStatus(cwd);
// Returns: { staged, modified, untracked, branch }

// Stage files
await gitAdd(cwd, ['src/file1.ts', 'src/file2.ts']);

// Create commit
await gitCommit(cwd, 'feat: add new feature', {
  all: false,
  noVerify: false
});

// Push to remote
await gitPush(cwd, {
  force: false,
  setUpstream: true
});

// Create pull request
await gitCreatePr(cwd, {
  base: 'main',
  draft: false,
  title: 'Feature: Add authentication'
});
```

## Type Definitions

```typescript
// Kit metadata
interface KitMetadata {
  cliVersion: string;
  kitPath: string;
  initializedAt: string;
}

// Git status
interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
  branch: string;
}

// Command metadata
interface CommandMetadata {
  title: string;
  description: string;
  agent: string;
  argumentHint?: string;
}

// File change
interface FileChange {
  path: string;
  status: 'staged' | 'modified' | 'untracked';
}

// Change analysis
interface ChangeAnalysis {
  files: FileChange[];
  categories: ChangeCategory[];
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDEKIT_PATH` | Override kit directory location | `./kits/default` (relative to project root) |

## Error Handling

All commands use consistent error handling:

```typescript
try {
  await someCommand();
} catch (error) {
  if (error instanceof Error) {
    logger.error(`Command failed: ${error.message}`);
  }
  process.exit(1);
}
```

Common errors:
- `ENOENT` - File/directory not found
- `EEXIST` - Directory already exists (use `--force`)
- `ValidationError` - Invalid metadata (Zod error)

## Logger API

```typescript
import { logger } from './shared/logger.js';

logger.info('Message');        // Info level
logger.success('Success');     // Success level
logger.warning('Warning');     // Warning level
logger.error('Error');         // Error level
```
