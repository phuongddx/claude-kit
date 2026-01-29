---
title: Fix CI
description: 👉👉👉 - Fix CI/CD pipeline failures
agent: debugger
argumentHint: "[job or error]"
---

# Fix CI Command

Diagnose and fix CI/CD pipeline failures.

## Usage

```
/fix:ci [job name or error description]
```

## Examples

- `/fix:ci Tests failing in GitHub Actions`
- `/fix:ci Build error: module not found`
- `/fix:ci Deployment failing with timeout`

## Process

1. Examine CI logs
2. Identify failure point
3. Reproduce locally if possible
4. Fix the issue
5. Verify with new run
6. Update CI config if needed

## Output

- Fixed CI configuration
- Updated dependencies
- Fixed tests or code
- Documentation for CI setup
