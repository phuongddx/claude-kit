---
title: iOS Debug
description: 👉👉👉 - Debug iOS crashes, concurrency issues, SwiftUI state problems, and performance issues
agent: ios-developer
argument-hint: 👉👉👉 [issue description or error log]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - mcp__xcodebuildmcp__discover_projs
  - mcp__xcodebuildmcp__list_schemes
  - mcp__xcodebuildmcp__build_sim
  - mcp__xcodebuildmcp__start_sim_log_cap
  - mcp__xcodebuildmcp__stop_sim_log_cap
  - mcp__xcodebuildmcp__start_device_log_cap
  - mcp__xcodebuildmcp__stop_device_log_cap
  - mcp__xcodebuildmcp__doctor
---

# iOS Debug Command

Debug iOS crashes, concurrency issues, SwiftUI state problems, and performance issues.

## Usage
```
/ios:debug app crashes on launch
/ios:debug SwiftUI view not updating
/ios:debug data race warning
/ios:debug memory leak in UserManager
```

## Your Process

1. **Reference Development Skill**
   - Use `skills/ios-development/development.md` for debugging patterns

2. **Understand the Symptom**
   - What error message or crash?
   - What should happen vs. what happens?
   - When does it occur (app launch, specific action)?

3. **Gather Context**
   - Crash logs and stack traces
   - Xcode console output
   - Recent code changes
   - iOS version/device

4. **Capture Logs (MCP preferred)**
   - Use `mcp__xcodebuildmcp__start_sim_log_cap` or `mcp__xcodebuildmcp__start_device_log_cap`
   - Reproduce the issue
   - Use `mcp__xcodebuildmcp__stop_sim_log_cap` to get logs

5. **Investigate**
   - Read relevant Swift code
   - Check for async/await issues
   - Verify MainActor usage
   - Analyze logs for errors

6. **Identify Root Cause**
   - Find where execution fails
   - Check for retain cycles
   - Verify thread safety
   - Determine issue category

7. **Explain and Suggest Fix**

## Issue Categories

### Concurrency Issues
- MainActor checker errors
- Data races
- Actor isolation problems
- Task cancellation issues

### SwiftUI State Problems
- @Observable not working
- View not updating
- @Binding issues
- State management errors

### Memory Issues
- Retain cycles
- Memory leaks
- Strong reference cycles
- Unowned/weak self problems

### Build/Signing Issues
- Code signing errors
- Provisioning profile problems
- Build configuration errors
- Dependency conflicts

## Rules
- Find root cause, not symptoms
- Provide file:line references
- Capture logs when available (MCP)
- Suggest prevention strategies
- Recommend Instruments usage for performance issues

## Completion Report

```markdown
## iOS Debug Analysis

### Issue Description
[What the user reported]

### Root Cause
[The actual problem]

### Issue Category
- Concurrency/UI/Memory/Build

### Evidence
- `File.swift:line` - [What's wrong]
- [Stack trace or error message]

### Affected Files
- `path/to/File.swift:line` - [Issue]

### Recommended Fix
\`\`\`swift
// Old code (problematic)
- old code

// New code (fixed)
+ new code
\`\`\`

### Verification Steps
1. Apply fix
2. Build and run
3. [Specific action to verify]

### Next Steps
- [ ] Apply recommended fix
- [ ] Test on simulator
- [ ] Test on device
```
