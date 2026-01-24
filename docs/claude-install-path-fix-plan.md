# Claude Code Installation Path Detection Fix

## Problem
CLI incorrectly detects "native" installation for Homebrew installs, checking `~/.local/bin/claude` instead of actual Homebrew path `/opt/homebrew/bin/claude`. This is a false-positive bug (GitHub #8415).

## Solution
**Option 2: Create symlink** - Minimal changes, preserves Homebrew installation, fixes the false-positive check.

## Implementation Steps

```bash
# 1. Create directory if missing
mkdir -p ~/.local/bin

# 2. Create symlink to actual Homebrew binary
ln -s /opt/homebrew/bin/claude ~/.local/bin/claude

# 3. Verify symlink
ls -la ~/.local/bin/claude
# Should show: ~/.local/bin/claude -> /opt/homebrew/bin/claude

# 4. Test claude command
claude --version

# 5. Test ClaudeKit CLI
cd /Users/ddphuong/Projects/claude-kit/cli && bun link
ck --version
```

## Alternative: Update ClaudeKit CLI (Future Enhancement)

File: `src/domains/installation/index.ts`

```typescript
// Function: detectInstallMethod()
// Detects actual Claude Code installation method by checking multiple binary locations
// Returns: 'homebrew' | 'native' | 'npm' | 'unknown'

// Function: getClaudeBinaryPath()
// Returns actual binary path based on detected install method
// Homebrew: /opt/homebrew/bin/claude
// Native: ~/.local/bin/claude
// npm: (from npm config)
```

## Verification

```bash
# 1. Check both paths work
which claude  # /opt/homebrew/bin/claude
~/.local/bin/claude --version  # Should work via symlink

# 2. Test in Claude Code
# Open project, verify no "installMethod is native" warning
```
