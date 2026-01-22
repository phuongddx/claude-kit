# Bug Fixing Workflow

## Trigger
User reports a bug or issue.

## Steps

### 1. Investigation
**Command**: `/debug [issue description]`
**Agent**: debugger
**Output**: Root cause analysis

The debugger agent:
- Gathers context (logs, errors)
- Reproduces the issue
- Identifies root cause
- Suggests fix

### 2. Fix Selection
**Simple bugs**: `/fix:fast [issue]`
**Complex bugs**: `/fix:hard [issue]`

### 3. Fix Implementation
**Agent**: fullstack-developer
**Output**: Fixed code

The developer agent:
- Applies the fix
- Writes test to prevent regression
- Updates docs if needed

### 4. Verification
**Command**: `/test`
**Agent**: tester
**Output**: Test results

### 5. Commit
**Command**: `/git:cm`
**Agent**: git-manager
**Output**: Commit with `fix:` type

## Flow Diagram
```mermaid
graph LR
    A[Bug Report] --> B[/debug command]
    B --> C[debugger agent]
    C --> D[Root cause found]
    D --> E[/fix:fast or /fix:hard]
    E --> F[fullstack-developer]
    F --> G[/test command]
    G --> H[tester agent]
    H --> I[/git:cm command]
    I --> J[git-manager]
    J --> K[Fixed and committed]
```

## Bug Categories

### Simple Bugs (use /fix:fast)
- Typos
- Missing imports
- Simple logic errors
- Configuration issues

### Complex Bugs (use /fix:hard)
- Race conditions
- Memory leaks
- Performance issues
- Architecture problems
- Security vulnerabilities

## Estimated Time
- Simple bug: 2-5 minutes
- Complex bug: 15-45 minutes
