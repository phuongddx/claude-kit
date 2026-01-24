---
title: Git Commit Command
description: 👉👉👉 - Stage and commit with conventional commits
agent: git-manager
argument-hint: 👉👉👉
---

# Git Commit Command

Create professional git commits.

## Usage
```
/git:commit
```

## Your Process
1. Run `git status` to see changes
2. Run `git diff` to see details
3. Categorize changes:
   - feat: New feature
   - fix: Bug fix
   - refactor: Code refactoring
   - docs: Documentation
   - test: Tests
   - chore: Maintenance
4. Generate conventional commit message
5. Stage relevant files
6. Create commit
7. Run pre-commit hooks if configured

## Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Rules
- Never commit sensitive files (.env, secrets)
- Never include Claude credentials
- Use conventional commit format
- Keep description under 72 chars
- Include body for significant changes

## Completion
Report:
- Files staged
- Commit message
- Commit hash
- Any hooks run
