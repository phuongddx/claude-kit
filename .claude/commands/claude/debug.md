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
  - AskUserQuestion
  - mcp__zread__read_file
  - mcp__web-search-prime__webSearchPrime
  - mcp__zai-mcp-server__diagnose_error_screenshot
  - mcp__zai-mcp-server__extract_text_from_screenshot
  - mcp__web-reader__webReader
---

# Claude Debug Command

Systematic debugging with structured investigation, root cause analysis, and actionable solutions.

## Usage

```
/claude:debug [issue description or error log]
/claude:debug TypeError: Cannot read property 'map' of undefined
/claude:debug Login button doesn't respond when clicked
```

With screenshot:
```
[Upload screenshot first]
/claude:debug This error appears when I try to save
```

## Input Handling

### Empty Input
If no input provided, display help:
```
Provide an issue description or error log to debug.

Examples:
  /claude:debug TypeError: Cannot read property 'x' of undefined
  /claude:debug App loads slowly on first render
  /claude:debug Tests failing after refactor

For best results, include:
  - Error messages or stack traces
  - Expected vs actual behavior
  - When the issue started occurring
```

### Long Error Logs
For error logs over 50 lines:
1. Extract the stack trace (first meaningful error)
2. Focus on error type and message
3. Note file locations from the trace
4. Ask user to confirm if multiple issues present

## Your Process

### Phase 1: Understand

Parse user input and categorize issue:

**Issue Categories:**
| Category | Examples |
|----------|----------|
| Syntax/Compile | TypeScript errors, missing imports, build failures |
| Runtime | Exceptions, null/undefined, async/await issues |
| Logic Bugs | Incorrect behavior, edge cases, state issues |
| Performance | Slow operations, memory leaks, inefficient code |
| Integration | API problems, database issues, third-party services |

**Clarifying Questions** (if needed):
- What were you trying to do?
- What did you expect to happen?
- What actually happened?
- When did this start happening?
- Can you share the error message or stack trace?

### Phase 2: Gather Context (Parallel)

Run these in parallel:

```bash
# Recent changes
git log --oneline -10

# Check for error patterns in code
# [Use Grep for relevant error terms]
```

**If MCP tools available:**
- Search web for similar issues
- Read GitHub docs for related libraries
- Analyze screenshots if provided

**MCP Fallback:**
If MCP tools unavailable, skip web research and use:
- Grep for error patterns
- Read for documentation
- Focus on codebase analysis

### Phase 3: Reproduce & Isolate

1. Understand the symptom
2. Identify reproduction steps
3. Create minimal reproduction case
4. Isolate the failing component/layer

### Phase 4: Root Cause Analysis

1. Trace code flow
2. Apply 5 Whys technique
3. Form testable hypotheses

### Phase 5: Provide Solution

1. Identify root cause clearly
2. Suggest fix with diff format
3. Provide verification steps
4. Suggest prevention strategies

### Phase 6: Task Tracking (Optional)

For complex multi-step debugging, create tasks:

```markdown
Tasks created:
- [ ] Gather context
- [ ] Reproduce issue
- [ ] Root cause analysis
- [ ] Verify fix
```

## Output Format

```markdown
### Issue Summary
[Brief 1-2 sentence description]

### Root Cause
[Clear explanation of what's causing the problem]

### Affected Files
- `/path/to/file.ts:line` - [how it's involved]
- `/path/to/file.ts:line` - [how it's involved]

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

## Screenshot Analysis

When screenshot provided with MCP tools:

1. Use `diagnose_error_screenshot` if error visible
2. Use `extract_text_from_screenshot` for console output
3. Cross-reference with codebase findings

Without MCP:
- Ask user to transcribe error text
- Describe visible UI elements
- Ask for console output

## Integration

Works with existing workflow:
```
/claude:debug [issue] → /fix:fast or /fix:hard → /test → /git:cm
```

## Security

- **Read-only by default** - This command analyzes only
- Use `/fix:fast` or `/fix:hard` to apply changes
- No git commands in diagnostic phase
