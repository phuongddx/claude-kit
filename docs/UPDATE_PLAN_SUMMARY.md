# CLI Update Command - Implementation Summary

## Quick Overview

Adding `ck update` command to sync kit template changes to existing projects. Simple file copy operation that preserves project-specific config files.

## Files to Create/Modify

### New Files (4)
1. `/cli/src/commands/update.ts` - CLI command handler
2. `/cli/src/domains/updater/index.ts` - Update orchestration
3. `/cli/src/domains/updater/file-syncer.ts` - File comparison & copying
4. `/cli/src/domains/updater/preserve-list.ts` - Files to never overwrite

### Modified Files (3)
5. `/cli/src/cli/cli-config.ts` - Register update command
6. `/cli/src/types/index.ts` - Add UpdateOptions interface
7. `/cli/src/domains/config/index.ts` - Add updateMetadata() function

## Core Functions

| Function | File | Purpose |
|----------|------|---------|
| `updateCommand()` | commands/update.ts | CLI entry point, shows prompts/results |
| `updateKit()` | domains/updater/index.ts | Orchestrates update, returns summary |
| `syncKitFiles()` | domains/updater/file-syncer.ts | Copies files, tracks changes |
| `getPreservedFiles()` | domains/updater/preserve-list.ts | Returns protected filenames |
| `shouldPreserveFile()` | domains/updater/file-syncer.ts | Checks if file is protected |
| `updateMetadata()` | domains/config/index.ts | Updates cliVersion, lastUpdated |

## Preserved Files

- **metadata.json** - Project install info
- **settings.local.json** - Local overrides (gitignored)

## What's NOT Included (Deliberately)

- No version checking
- No hash comparison
- No conflict resolution
- No backups
- No rollback
- No dry-run mode
- No migration scripts

## Command Usage

```bash
ck update              # Update current directory
ck update [path]       # Update specific path
```

## Reuses Existing Services

- `resolveKitPath()` - Kit path resolution
- `directoryExists()` - Directory checking
- `readMetadata()` - Read metadata.json
- `isProjectInitialized()` - Project validation
- `copyFile()` / `copyDirectory()` - File operations
- `logger` - Styled output
- `@clack/prompts` - CLI prompts
