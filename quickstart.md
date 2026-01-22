# Quickstart Guide

Test ClaudeKit with this hands-on walkthrough.

## Prerequisites

- Bun installed (`brew install bun`)
- Git installed

## Step 1: Install the CLI

```bash
cd cli
bun install
bun link
```

Verify: `ck --version` should show version info.

## Step 2: Create a Test Project

```bash
# Navigate to a temp directory
cd /tmp

# Create a new project
ck new test-app
cd test-app
```

This creates:
- `test-app/.claude/` - All agents, commands, skills, workflows
- `test-app/CLAUDE.md` - Project context template
- `test-app/.gitignore` - Git ignore file

## Step 3: Explore the Kit

```bash
# List all commands
ls .claude/commands/core/

# List all skills
ls .claude/skills/

# List all agents
ls .claude/agents/

# View a command
cat .claude/commands/core/cook.md
```

## Step 4: Test Initialization (Optional)

If you have an existing project you want to test with:

```bash
cd /path/to/existing-project
ck init .
```

## Step 5: Use in Claude Code

Open your test project in Claude Code and try:

```bash
# Ask about the codebase
/ask what commands are available?

# Create a plan
/plan add a simple hello world feature

# Implement the plan
/cook plans/[plan-file].md

# Run tests
/test

# Commit changes
/git:cm
```

## Verification Checklist

- [ ] `ck --version` works
- [ ] `ck new test-app` creates project
- [ ] `.claude/` folder contains agents/, commands/, skills/, workflows/
- [ ] Commands have frontmatter (title, description, agent)
- [ ] Skills contain domain expertise
- [ ] Workflows define multi-agent flows

## Uninstall

```bash
# Unlink the CLI
bun unlink -g ck

# Or remove manually
rm -rf $(bun pm -g)/bin/ck
```

## Next Steps

- Read [CLAUDE.md](./CLAUDE.md) for architecture details
- Check [docs/](./docs/) for implementation plans
- Customize `kits/default/.claude/` for your needs
