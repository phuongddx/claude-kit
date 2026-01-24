---
title: Cook Command
description: Implement features from plans or descriptions
agent: fullstack-developer
argument-hint: 👉👉👉 [feature description or path/to/plan.md]
---

# Cook Command

Implement features - the main development command.

## Usage
```
/cook [feature description]
/cook plans/[plan-file].md
```

## Your Process

### If plan file provided:
1. Read the plan
2. Implement precisely
3. Write tests
4. Update docs

### If only description:
1. Ask: should I create a plan first?
2. If yes: create plan, then implement
3. If no: implement directly

## Implementation Steps
1. Install dependencies (if needed)
2. Create files in order
3. Modify existing files
4. Write tests
5. Update documentation
6. Verify it works

## Rules
- Follow plans exactly when provided
- Always write tests for new code
- Update relevant docs
- Report progress per file

## Completion
Report:
- Files created: [count]
- Files modified: [count]
- Tests written: [count]
- How to test
- Any issues
