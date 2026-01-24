# `/claude:debug` Command Implementation Plan

## Overview
A systematic debugging command that enhances Claude Code's debugging capabilities with structured investigation, root cause analysis, and actionable solutions.

## File Location
```
.claude/commands/claude/debug.md
```

## Command Specification

### Frontmatter
```yaml
---
title: Claude Debug Command
description: Debug issues with systematic investigation
agent: debugger
argument-hint: [issue description or error log]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - TaskCreate
  - TaskUpdate
  - TaskList
  - mcp__zread__read_file
  - mcp__web-search-prime__webSearchPrime
  - mcp__zai-mcp-server__diagnose_error_screenshot
  - mcp__zai-mcp-server__extract_text_from_screenshot
  - mcp__web-reader__webReader
---
```

## Debugging Workflow

### Phase 1: Understand
- Parse user input
- Categorize issue type
- Ask clarifying questions if needed:
  - What were you trying to do?
  - What did you expect to happen?
  - What actually happened?
  - Can you share an error message or stack trace?
  - When did this start happening?

### Phase 2: Gather Context (Parallel)
```bash
# Recent changes
git log --oneline -10
git diff HEAD~1

# Error patterns (Grep)
```

### Phase 3: Reproduce & Isolate
- Understand the symptom
- Identify reproduction steps
- Create minimal reproduction case
- Isolate the failing component/layer

### Phase 4: Root Cause Analysis
- Trace code flow
- Apply 5 Whys technique
- Form testable hypotheses

### Phase 5: Provide Solution
- Identify root cause
- Suggest fix with diff
- Provide verification steps
- Suggest prevention strategies

## Issue Categories

| Category | Examples |
|----------|----------|
| **Syntax/Compile Errors** | TypeScript type errors, missing imports, build failures |
| **Runtime Errors** | Exceptions, null/undefined references, async/await issues |
| **Logic Bugs** | Incorrect behavior, edge cases, state issues |
| **Performance Issues** | Slow operations, memory leaks, inefficient code |
| **Integration Issues** | API problems, database issues, third-party services |

## Output Format

```markdown
### Issue Summary
[Brief 1-2 sentence description]

### Root Cause
[Clear explanation of what's causing the problem]

### Affected Files
- `/path/to/file.ts` - [how it's involved]
- `/path/to/file.ts` - [how it's involved]

### Suggested Fix
```diff
- old code
+ new code
```

### Verification Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Prevention
[How to avoid similar issues]
```

## Usage Examples

```bash
# Error log
/claude:debug TypeError: Cannot read property 'map' of undefined

# Behavioral issue
/claude:debug Login button doesn't respond when clicked

# Performance
/claude:debug App loads very slowly on first render

# With screenshot
[Upload screenshot]
/claude:debug This error appears when I try to save
```

## Integration

Works with existing workflow:
```
/claude:debug [issue] → /fix:fast or /fix:hard → /test → /git:cm
```

## Security Notes

- **Read-only tools** - No Write/Edit in allowed-tools
- **No git commands** - Prevents accidental commits
- **MCP tools optional** - Falls back gracefully if unavailable

## Best Practices Applied

| Practice | Implementation |
|----------|----------------|
| Brief description | "Debug issues with systematic investigation" |
| No hype words | Avoids "Enhanced", "Improved", "Better" |
| Direct naming | `/claude:debug` clearly indicates purpose |
| Agent delegation | Uses existing `debugger` agent |
| Token efficiency | Parallel tool calls, targeted searches |
| Namespace | `claude/` subdirectory prevents conflicts |

## Comparison with Existing `/debug`

| Aspect | `/debug` | `/claude:debug` |
|--------|----------|-----------------|
| Namespace | Core | Custom (claude:) |
| Frontmatter | Basic | Advanced (allowed-tools, argument-hint) |
| MCP integration | None | Web search, GitHub research, screenshot analysis |
| Input handling | Basic | Enhanced with validation |
| Output format | Simple | Structured report |
| External research | Manual | Automated (via MCP) |

Both commands can coexist:
- `/debug` - Quick, simple debugging
- `/claude:debug` - Thorough, systematic debugging with external research
