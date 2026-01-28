---
title: iOS Test
description: 👉👉👉 - Run iOS unit tests and UI tests using xcodebuild or XcodeBuildMCP
agent: ios-developer
argument-hint: 👉👉👉 [--unit | --ui | --coverage | test-target]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - mcp__xcodebuildmcp__discover_projs
  - mcp__xcodebuildmcp__list_schemes
  - mcp__xcodebuildmcp__test_sim
  - mcp__xcodebuildmcp__test_device
  - mcp__xcodebuildmcp__start_sim_log_cap
  - mcp__xcodebuildmcp__stop_sim_log_cap
  - mcp__xcodebuildmcp__doctor
---

# iOS Test Command

Run iOS unit tests and UI tests using xcodebuild or XcodeBuildMCP. Provides coverage metrics and failure analysis.

## Usage
```
/ios:test                           # Run all tests
/ios:test --unit                    # Unit tests only
/ios:test --ui                      # UI tests only
/ios:test MyAppTests                # Specific test target
/ios:test --coverage                # With coverage report
```

## Your Process

1. **Reference Tester Skill**
   - Use `skills/ios-development/tester.md` for testing patterns

2. **Discover Project (MCP preferred)**
   - Use `mcp__xcodebuildmcp__discover_projs` if available
   - Fallback: Glob for `.xcodeproj`/`.xcworkspace`
   - Use `mcp__xcodebuildmcp__list_schemes` to identify test targets

3. **Parse Arguments**
   - `--unit`: Run only unit tests
   - `--ui`: Run only UI tests
   - `--coverage`: Include coverage metrics
   - Test target name: Run specific target

4. **Run Tests**
   - Use `mcp__xcodebuildmcp__test_sim` or `mcp__xcodebuildmcp__test_device` if MCP available
   - Fallback: xcodebuild test command via Bash
   - Capture test output

5. **Parse Results**
   - Count passed/failed tests
   - Calculate coverage if requested
   - Identify failure reasons

6. **Report**
   - Summary of test results
   - Coverage metrics
   - Failure diagnostics
   - Recommendations for fixes

## Rules
- Use MCP tools when available for faster execution
- Always run unit tests before UI tests
- Capture logs for debugging failures
- Provide specific file:line references for failures
- Suggest fixes for common test issues

## Completion Report

```markdown
## iOS Test Results

### Tests Run
- Total: X
- Passed: ✓ X
- Failed: ✗ X

### Execution Time
- Duration: X seconds

### Coverage
- Statements: X%
- Branches: X%
- Functions: X%

### Failed Tests
- `TestName` - Reason for failure
  - File:line reference
  - Suggested fix

### Recommendations
- [ ] Fix failing tests
- [ ] Improve coverage
```
