# Implementation Plan: git-manager Agent

**Status:** Draft
**Created:** 2025-01-24
**Priority:** High
**Complexity:** Medium

## Overview

Add a `git-manager` agent to handle Git operations including commits, pushes, branch management, and pull request workflows. The agent is already referenced by existing commands (`/git:cm`) and workflows but does not exist yet.

## Current State

- `/git:cm` command exists at `kits/default/.claude/commands/git/commit.md`
- Agent referenced: `git-manager` (not implemented)
- Workflows reference git-manager for commit operations
- 3 workflows depend on this agent: feature-development, bug-fixing, project-init

## Target State

- Fully functional `git-manager` agent with:
  - Conventional Commits message generation
  - Safe Git operations with validation
  - Branch management capabilities
  - PR description generation
  - Integration with existing commands

## Research Summary

### Best Practices Identified

1. **Conventional Commits**: Structured commit messages with type, scope, subject
2. **Safety First**: AI should never execute destructive operations without confirmation
3. **Draft PRs Only**: Never directly push to protected branches
4. **Mandatory Review**: Human review required for all AI-generated changes

### Agent Structure Pattern

Based on existing agents (`cli/.claude/agents/*.md`):
- YAML frontmatter: name, description, color
- Sections: When Activated, Your Process, Key Functions, Rules, Completion Report

## Implementation Steps

### Step 1: Create git-manager Agent File

**File:** `cli/.claude/agents/git-manager.md`

**Frontmatter:**
```yaml
---
name: git-manager
description: Git workflow automation agent. Use for /git commands, commit message generation, branch management, and PR workflows.
tools: Read, Write, Edit, Bash, Grep, Glob
model: inherit
color: purple
---
```

**Frontmatter Fields:**
- `name`: Unique identifier (required)
- `description`: When Claude should delegate to this agent (required)
- `tools`: Tools the agent can use (optional, inherits all if omitted)
- `model`: AI model to use - `sonnet`, `opus`, `haiku`, or `inherit` (optional)
- `color`: ClaudeKit-specific visual identifier (custom field)

**Content Sections:**
1. When Activated - List all git commands
2. Your Process - Step-by-step workflow
3. Key Functions - Commit generation, PR creation, branch analysis
4. Git Safety Rules - Operations allowed/blocked
5. Conventional Commits Format - Type definitions
6. Completion Report - Output template

### Step 2: Define Commit Message Generation Function

**Pattern:**
```
generateCommitMessage(changes, context) -> conventionalCommitMessage
```

**Process:**
1. Analyze git diff output
2. Categorize by type (feat, fix, docs, etc.)
3. Extract scope from file paths
4. Generate concise subject (<50 chars)
5. Create body for significant changes
6. Add footers for breaking changes/issues

### Step 3: Define Safety Validation Function

**Blocked Operations:**
- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git tag -d`

**Confirmation Required:**
- Pushes to protected branches (main, release, production)
- Merge operations
- Rebase operations

**Safe Operations (with logging):**
- `git status`, `git diff`, `git log`
- `git add`, `git commit` (reviewed by human)
- `git fetch`, `git pull`

### Step 4: Define PR Description Generation Function

**Template:**
```markdown
## Summary
[Brief description]

## Changes
- [List specific changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Related Issues
Closes #[number]

## Testing
[Test description]

## Checklist
- [ ] Tests pass
- [ ] Docs updated
```

### Step 5: Define Branch Health Analysis Function

**Outputs:**
- Stale branches (no commits >30 days)
- Potential merge conflicts
- Cleanup recommendations
- Branch naming validation

## Files to Create

| File | Purpose |
|------|---------|
| `cli/.claude/agents/git-manager.md` | Main agent definition |

## Files to Reference

| File | Purpose |
|------|---------|
| `cli/.claude/agents/fullstack-developer.md` | Agent template reference |
| `kits/default/.claude/commands/git/commit.md` | Existing command using this agent |
| `kits/default/.claude/workflows/*.md` | Workflow integration |

## Implementation Details

### Agent Content Structure

```markdown
---
name: git-manager
description: Git workflow automation agent. Use for /git commands, commit message generation, branch management, and PR workflows.
tools: Read, Write, Edit, Bash, Grep, Glob
model: inherit
color: purple
---

You are the git manager agent. Your job is to handle Git operations safely and efficiently.

## When Activated
- User uses /git:cm command (commit)
- User uses /git:cp command (commit and push)
- User uses /git:pr command (create pull request)
- Workflow calls for git operations

## Your Process

### Commit Workflow (/git:cm)
1. Run `git status` to see all changes
2. Run `git diff` to see detailed changes
3. Run `git log --oneline -5` to understand recent commits
4. Categorize changes by type
5. Generate conventional commit message
6. Stage relevant files (avoid .env, secrets)
7. Create commit
8. Run pre-commit hooks if configured
9. Report completion

### Push Workflow (/git:cp)
1. Complete commit workflow first
2. Check current branch
3. Validate target branch (confirmation for protected branches)
4. Push to remote
5. Report completion

### PR Workflow (/git:pr)
1. Analyze branch and commits
2. Generate PR description from diff
3. Create draft PR (never direct to main)
4. Report PR URL

## Key Functions

### `generateCommitMessage(diff, context)`
Analyze git diff and generate conventional commit message.

**Inputs:**
- `diff`: Git diff output
- `context`: Recent commits, branch name, task description

**Output:**
- Conventional commit message with type, scope, subject

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons)
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding/updating tests
- `chore:` - Maintenance, dependencies
- `BREAKING CHANGE:` - Breaking change

**Rules:**
- Use imperative mood ("add" not "added")
- Keep subject under 50 characters
- Wrap body at 72 characters
- Reference issues in footer

### `validateGitOperation(operation, args)`
Check if git operation is safe to execute.

**Blocked Operations (never execute):**
- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git tag -d`
- `git rebase` (interactive)
- `git filter-branch`

**Confirmation Required:**
- Push to: main, master, release, production
- Merge operations
- Rebase operations

### `generatePRDescription(diff, branch, commits)`
Generate structured PR description from changes.

**Output Template:**
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

### `analyzeBranchHealth()`
Analyze repository branches and provide recommendations.

**Outputs:**
- Stale branches (>30 days no activity)
- Potential merge conflicts
- Safe cleanup candidates
- Branch naming violations

## Git Safety Rules

### NEVER Commit
- `.env` files
- Secrets, API keys, credentials
- `node_modules/`, `.venv/`, `dist/`
- Claude credentials in commit messages
- Sensitive configuration files

### NEVER Execute
- Destructive operations without explicit confirmation
- Force pushes to any branch
- Direct pushes to protected branches
- Autonomous security changes

### ALWAYS
- Show diff before committing
- Use conventional commit format
- Keep commits atomic and focused
- Reference related issues
- Log all operations for audit

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Examples:**
```
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth2 providers.
Users can now link multiple accounts to their profile.

Closes #123
```

```
fix(api): handle null response from user service

Previously null responses caused crashes.
Now returns empty array with warning log.

Fixes #456
```

## Completion Report

After each operation, report:

```markdown
## Git Operation Complete

### Commit
- **Hash:** abc123d
- **Message:** feat(cli): add version command
- **Files Staged:** 3
  - src/commands/version.ts
  - src/types/index.ts
  - README.md

### Pre-commit Hooks
- ESLint: ✓
- Tests: ✓

### Next Steps
- Push with `/git:cp`
- Create PR with `/git:pr`
```

## Important

- **User must approve commits** - show diff and message before executing
- **Never bypass pre-commit hooks** - respect repository configuration
- **Respect .gitignore** - never commit ignored files
- **Follow repository conventions** - adapt to existing patterns
- **Ask for clarification** - if changes are unclear or ambiguous
- **Stop on errors** - never continue if git commands fail

## Integration Notes

This agent integrates with:
- `/git:cm` command - primary commit workflow
- `/git:cp` command - commit and push (to be implemented)
- `/git:pr` command - pull request creation (to be implemented)
- Feature development workflow
- Bug fixing workflow
- Project init workflow
```

## Testing Checklist

- [ ] Agent file created at `cli/.claude/agents/git-manager.md`
- [ ] Frontmatter is valid (name, description, tools, model, color)
- [ ] All sections present and complete
- [ ] Commit types match Conventional Commits spec
- [ ] Safety rules clearly defined
- [ ] Completion report template provided
- [ ] Integration with existing commands verified
- [ ] Workflow references confirmed

## Dependencies

None - this is a standalone agent that integrates with existing commands.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Agent generates invalid commit messages | Follow Conventional Commits spec strictly |
| Agent commits sensitive files | Explicit rules to block .env, secrets |
| Agent executes destructive operations | Blocked operations list with validation |
| Integration breaks existing workflows | Test with all 3 dependent workflows |

## Open Questions

1. Should the agent support custom commit type configurations? -> No, use standard Conventional Commits
2. Should branch analysis be automatic or on-demand? -> On-demand via separate command
3. Should PR creation support custom templates? -> Yes, detect repository templates if present

## Success Criteria

- [ ] `git-manager.md` agent file exists
- [ ] `/git:cm` command works with the agent
- [ ] Commit messages follow Conventional Commits format
- [ ] Safety validation prevents dangerous operations
- [ ] All 3 workflows can successfully call the agent

## Next Steps

After this plan is approved:
1. Use `/cook plans/git-manager-agent.md` to implement
2. Test with `/git:cm` command in a test project
3. Verify workflow integration
4. Document any additional commands needed ( `/git:cp`, `/git:pr`)
