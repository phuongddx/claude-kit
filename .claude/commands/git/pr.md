---
title: Git Pull Request Command
description: 👉👉👉 - Create GitHub pull request from current branch
agent: git-manager
argument-hint: 👉👉👉
---

# Git Pull Request Command

Create GitHub pull request from current branch.

## Usage
```
/git:pr
```

## Your Process
1. Check if GitHub CLI (gh) is installed
2. Analyze branch and commits
3. Generate PR description from diff
4. Create draft PR (never direct to main)
5. Report PR URL

## PR Description Template
```markdown
## Summary
[Concise summary of changes]

## Changes
- [Categorized list of changes]

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #[issue-number]

## Testing
[Testing approach and results]

## Checklist
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No new warnings
```

## Rules
- Never create PR directly to main/master
- Always use draft for review first
- Generate description from actual changes
- Link related issues

## Completion
Report:
- PR URL
- Branch and base
- Commit count
