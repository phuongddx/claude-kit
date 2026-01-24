# CLI Update Command Implementation Plan

## Overview

Adding `ck update` command to sync kit template changes to existing ClaudeKit projects. The command will copy updated files from the kit template to the project's `.claude/` directory while preserving project-specific configuration files.

## What We're Implementing

A straightforward file synchronization command that:
1. Reads kit files from `CLAUDEKIT_PATH` (or default `./kits/default`)
2. Copies updated files to existing project's `.claude/` directory
3. Preserves `metadata.json` and `settings.local.json` (project-specific files)
4. Shows a summary of updated files

**No version checking, no migration logic, no backward compatibility** - just simple file syncing for now.

## Files to Create/Modify

### New Files

1. **`/cli/src/commands/update.ts`** (new)
   - Main command handler for `ck update`
   - Orchestrates the update flow

2. **`/cli/src/domains/updater/index.ts`** (new)
   - Core update logic
   - Coordinates file comparison and copying

3. **`/cli/src/domains/updater/file-syncer.ts`** (new)
   - Handles file comparison and synchronization
   - Determines which files to update

4. **`/cli/src/domains/updater/preserve-list.ts`** (new)
   - Defines files to preserve during updates
   - Simple list of protected filenames

### Modified Files

5. **`/cli/src/cli/cli-config.ts`** (modify)
   - Add `update` command registration

6. **`/cli/src/types/index.ts`** (modify)
   - Add `UpdateOptions` interface

7. **`/cli/src/shared/constants.ts`** (modify - if needed)
   - May add preserved file list constant

## Implementation Approach

### Command Flow

```
ck update [path]
           ↓
1. Resolve target path (default: current directory)
2. Check if project is initialized (has metadata.json)
3. Resolve kit path (CLAUDEKIT_PATH or default)
4. Compare kit files with project files
5. Copy updated files (excluding preserved files)
6. Update metadata.json (cliVersion, lastUpdated)
7. Show summary of changes
```

### File Preservation Strategy

Simple filename-based exclusion:
- **Always preserve:** `metadata.json`, `settings.local.json`
- **Always overwrite:** Everything else (agents, commands, skills, workflows, settings.json)

This matches the current `ck new` behavior where these files are project-specific.

### Core Functions

#### 1. `updateCommand(targetPath: string, options?: UpdateOptions): Promise<void>`
**File:** `/cli/src/commands/update.ts`

Main CLI command handler. Displays prompts, validates project, calls update domain service, shows results.

#### 2. `updateKit(kitPath: string, targetPath: string): UpdateResult`
**File:** `/cli/src/domains/updater/index.ts`

Orchestrates the update process. Returns list of updated files and counts.

#### 3. `syncKitFiles(kitPath: string, targetPath: string, subdir: string): UpdatedFile[]`
**File:** `/cli/src/domains/updater/file-syncer.ts`

Compares kit source with project target, copies changed/new files, returns list of updated file paths.

#### 4. `getPreservedFiles(): string[]`
**File:** `/cli/src/domains/updater/preserve-list.ts`

Returns array of filenames to never overwrite. Simple: `['metadata.json', 'settings.local.json']`

#### 5. `shouldPreserveFile(filePath: string, preservedFiles: string[]): boolean`
**File:** `/cli/src/domains/updater/file-syncer.ts`

Checks if a file should be preserved based on filename match.

#### 6. `updateMetadata(targetPath: string): void`
**File:** `/cli/src/domains/config/index.ts` (extend existing)

Updates metadata.json with new cliVersion and lastUpdated timestamp.

## Detailed Implementation

### 1. Command Handler (`/cli/src/commands/update.ts`)

```typescript
export async function updateCommand(targetPath: string = '.'): Promise<void> {
  // Intro message
  // Resolve absolute path
  // Check if project initialized
  // Resolve kit path
  // Call updateKit()
  // Show results (files updated, counts)
  // Outro message
}
```

### 2. Update Domain (`/cli/src/domains/updater/index.ts`)

```typescript
export interface UpdateResult {
  updatedFiles: string[];
  preservedFiles: string[];
  fileCount: number;
}

export function updateKit(kitPath: string, targetPath: string): UpdateResult {
  // Sync files
  // Update metadata
  // Return result
}
```

### 3. File Syncer (`/cli/src/domains/updater/file-syncer.ts`)

```typescript
export interface UpdatedFile {
  path: string;
  action: 'created' | 'updated';
}

export function syncKitFiles(
  kitPath: string,
  targetPath: string,
  subdir: string
): UpdatedFile[] {
  // Scan kit source directory
  // For each file:
  //   - Check if preserved
  //   - If not preserved, copy to target
  //   - Track action (created/updated)
  // Return list of updated files
}
```

### 4. Preserve List (`/cli/src/domains/updater/preserve-list.ts`)

```typescript
export function getPreservedFiles(): string[] {
  return ['metadata.json', 'settings.local.json'];
}
```

### 5. CLI Config Update (`/cli/src/cli/cli-config.ts`)

Add to existing commands:
```typescript
import { updateCommand } from '../commands/update.js';

cli.command('update [path]', 'Update ClaudeKit in existing project')
  .action(async (path: string = '.') => {
    await updateCommand(path);
  });
```

### 6. Types Update (`/cli/src/types/index.ts`)

Add new interface:
```typescript
export interface UpdateOptions {
  dryRun?: boolean;  // Optional: show what would change without modifying
}
```

## Reused Components

### Existing Services
- **`resolveKitPath()`** - Already handles CLAUDEKIT_PATH resolution
- **`resolveAbsolutePath()`** - Already handles path resolution
- **`directoryExists()`** - Already checks directory existence
- **`readMetadata()`** - Already reads metadata.json
- **`isProjectInitialized()`** - Already checks for metadata.json
- **`copyFile()`** / **`copyDirectory()`** - Already handle file copying
- **`logger`** - Already handles styled output
- **`@clack/prompts`** - Already used for CLI interaction

### New Patterns
- **File comparison** - Simple "if exists" check (no hash comparison yet)
- **Update tracking** - Return list of modified files for display

## Edge Cases & Considerations

### Current Behavior (What We're NOT Doing)

1. **No version checking** - Won't compare kit versions or check if update is needed
2. **No migration logic** - Won't transform old file formats to new ones
3. **No conflict resolution** - Won't ask user what to do with modified files
4. **No backup** - Won't create backups before overwriting
5. **No hash comparison** - Won't check if files actually changed before copying
6. **No selective updates** - All-or-nothing update (can't update only specific directories)

### What We ARE Doing

1. **Simple file sync** - Copy everything from kit except preserved files
2. **Project validation** - Check project has metadata.json before updating
3. **Basic reporting** - Show how many files were updated
4. **Metadata update** - Update cliVersion and add lastUpdated timestamp

### Files Handled Differently

| File | Behavior | Reason |
|------|----------|--------|
| `metadata.json` | Preserved, then updated | Contains project-specific install info |
| `settings.local.json` | Preserved | Local overrides, gitignored |
| `settings.json` | Overwritten | Kit configuration, should sync |
| All others | Overwritten | Template files, should sync |

### Error Handling

- Kit path not found → Error and exit
- Target path not a ClaudeKit project → Error and exit
- File system errors during copy → Log and continue (best effort)

## User Experience

### Success Output

```
✔ ClaudeKit Update

Checking project... /path/to/project
Found ClaudeKit v1.0.0
Updating from kit: /path/to/kits/default

✔ Updated 12 files
  • commands/core/plan.md
  • commands/core/cook.md
  • agents/researcher.md
  • ...

✔ Preserved 2 files
  • metadata.json (updated cliVersion)
  • settings.local.json

✔ Update complete
```

### Error Output

```
✖ ClaudeKit Update

✖ Not a ClaudeKit project
  No metadata.json found in /path/to/project/.claude/

  Run 'ck init' to initialize this project first.
```

## Testing Plan

```bash
# Setup
cd /tmp
ck new test-project
cd test-project

# Test update
ck update

# Test preserved files
echo "// local changes" >> .claude/settings.local.json
ck update  # settings.local.json should be unchanged

# Test non-project directory
cd /tmp
ck update  # Should error

# Test explicit path
ck update /tmp/test-project
```

## Future Enhancements (Out of Scope)

- Version-based updates (only update if kit version changed)
- Hash-based comparison (only copy if file content changed)
- Interactive conflict resolution
- Selective updates (e.g., only update commands)
- Backup creation before update
- Migration scripts for breaking changes
- Dry-run mode to preview changes
- Rollback capability
