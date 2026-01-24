---
title: Git Push Command
description: 👉👉👉 - Commit changes and push to remote
agent: git-manager
argument-hint: 👉👉👉
---

# Git Push Command

Commit changes and push to remote repository.

## Usage
```
/git:push
```

## Your Process
1. Complete the commit workflow (see /git:commit)
2. Check current branch
3. Validate target branch (confirmation for protected branches)
4. Push to remote
5. Report completion

## Rules
- Never force push to main/master/release/production
- Always confirm before pushing to protected branches
- Show commit hash and branch before pushing
- Handle push conflicts gracefully

## Completion
Report:
- Commit hash
- Branch pushed
- Remote URL
- Any conflicts encountered
