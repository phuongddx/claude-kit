---
title: Plan Command
description: 👉👉👉 - Create detailed implementation plans
agent: planner
argument-hint: 👉👉👉 [feature description]
---

# Plan Command

Create detailed implementation plans before coding.

## Usage
```
/plan [feature description]
```

## Your Process
1. Parse the feature request
2. Spawn 3 researcher agents:
   - Best practices research
   - Existing codebase analysis
   - Dependencies check
3. Aggregate findings
4. Create detailed plan
5. Save to plans/ directory

## Plan Template
See planner.md agent for template

## Completion
Report:
- Plan created: plans/[filename].md
- Summary of research
- Implementation steps count
- Files to create/modify
- Estimated complexity
- Next: /cook plans/[filename].md
