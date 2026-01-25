# Command Quickstart Guide

Create new documentation generation commands for your projects using this template.

## Overview

The `/docs:init` command scans your entire codebase and generates comprehensive documentation files in a `docs/` directory. This guide shows you how to create similar commands for your own projects.

## File Structure

Commands are defined as markdown files with YAML frontmatter:

```
.claude/
└── commands/
    └── docs/
        └── init.md
```

## Command Template

```markdown
---
title: [Command Title]
description: [Brief description with emoji]
agent: [agent-name]
argument-hint: [usage hint with emoji]
---

# [Command Name] Command

[Brief description of what this command does]

## Usage
```
/command-name [argument]
```

## Your Process

### 1. [Step 1 Title]
- [Action 1]
- [Action 2]

### 2. [Step 2 Title]
- [Action 1]
- [Action 2]

## Rules
- [Rule 1]
- [Rule 2]

## Completion
Report:
- [Result 1]
- [Result 2]
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Human-readable command title |
| `description` | Yes | Short description (shown in CLI) |
| `agent` | Yes | Which agent handles this command |
| `argument-hint` | No | Usage hint shown in autocomplete |

## Available Agents

| Agent | Best For |
|-------|----------|
| `planner` | Research-heavy tasks, implementation plans |
| `fullstack-developer` | Writing code, implementing features |
| `researcher` | Gathering information, best practices |
| `tester` | Writing and running tests |
| `debugger` | Diagnosing issues, root cause analysis |

## Example Commands

### 1. Simple Command

```markdown
---
title: Status Check
description: 🔍 - Check project status
agent: planner
argument-hint: 🔍 [check all services]
---

# Status Command

Check the status of all project services.

## Usage
```
/status
```

## Your Process
1. Check each service
2. Report status

## Completion
Report:
- Services checked
- Overall status
```

### 2. Code Generation Command

```markdown
---
title: Generate Component
description: ⚛️ - Generate React component
agent: fullstack-developer
argument-hint: ⚛️ [component name]
---

# Generate Component

Create a new React component with hooks and tests.

## Usage
```
/gen:component Button
```

## Your Process
1. Create component file
2. Add hooks
3. Write tests
4. Create stories

## Template
```tsx
export function [Name]() {
  return <div>[Name]</div>
}
```

## Completion
Report:
- Files created
- Test status
```

### 3. Documentation Command (like /docs:init)

```markdown
---
title: Initialize Documentation
description: 📚 - Scan codebase and generate docs
agent: planner
argument-hint: 📚 [scan entire codebase]
---

# Docs: Init Command

Scan codebase and generate documentation.

## Usage
```
/docs:init
```

## Your Process

### 1. Scan the Codebase
- Use Glob to explore directories
- Use Grep to find patterns
- Read key files

### 2. Generate Files
Create each documentation file with proper analysis

### 3. Save Files
- Create docs/ directory
- Write markdown files

## Analysis Rules
- Scan everything
- Look for config files
- Find patterns

## Completion
Report:
- Files created
- Summary of findings
```

## Command Categories

### Core Commands (`/core/*`)
Primary development commands:
- `/core:cook` - Implement features
- `/core:plan` - Create plans
- `/core:test` - Run tests
- `/core:debug` - Debug issues
- `/core:ask` - Query codebase

### Fix Commands (`/fix/*`)
Quick fixes:
- `/fix:fast` - Simple bug fixes
- `/fix:type` - Type errors

### Git Commands (`/git/*`)
Git workflows:
- `/git:cm` - Commit changes
- `/git:cp` - Commit and push
- `/git:pr` - Create pull request

### Docs Commands (`/docs/*`)
Documentation:
- `/docs:init` - Generate documentation

## Best Practices

### 1. Clear Purpose
Each command should do one thing well.

### 2. Specific Process
Define clear steps for the agent to follow.

### 3. Completion Report
Always specify what to report when done.

### 4. Use Emojis
Emojis help commands stand out in the CLI.

### 5. Argument Hints
Provide usage hints for autocomplete.

## Testing Your Command

1. Create the command file:
```bash
mkdir -p .claude/commands/docs
touch .claude/commands/docs/init.md
```

2. Add your command content

3. Test in Claude Code:
```
/docs:init
```

4. Verify output matches expectations

## Advanced Patterns

### Spawning Sub-agents

```markdown
## Your Process
1. Spawn 3 researchers in parallel:
   Use the Task tool with subagent_type="researcher" for:
   - Research best practices
   - Analyze existing code
   - Check dependencies
2. Aggregate findings
3. Create implementation
```

### File Templates

```markdown
## Template
```typescript
// src/[name].ts
export function [Name]() {
  // Implementation
}
```
```

### Conditional Logic

```markdown
## Your Process
### If condition A:
1. Do A things
### If condition B:
1. Do B things
### Otherwise:
1. Default behavior
```

## Creating Command Sets

For related commands, organize by category:

```
.claude/commands/
├── core/
│   ├── cook.md
│   ├── plan.md
│   └── test.md
├── fix/
│   ├── fast.md
│   └── type.md
├── git/
│   ├── commit.md
│   └── push.md
└── docs/
    ├── init.md
    └── update.md
```

## Summary

1. **Create file**: `.claude/commands/category/name.md`
2. **Add frontmatter**: title, description, agent, argument-hint
3. **Define process**: Clear steps for the agent
4. **Specify completion**: What to report
5. **Test**: Run in Claude Code and verify

The command will be available as `/category:name` (e.g., `/docs:init`).
