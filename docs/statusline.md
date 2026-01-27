# ClaudeKit Statusline

Custom statusline for Claude Code that displays contextual information about your development session.

## Features

The ClaudeKit statusline displays:

- **Model Name** - Which Claude model is active (Opus, Sonnet, Haiku)
- **Current Directory** - Project folder name
- **Git Branch** - Active git branch with colored emoji
- **Session Cost** - Total API cost in USD (formats as cents for small amounts)
- **Context Usage** - Percentage of context window used (color-coded: green/yellow/red)

## Installation

### Option 1: Using the CLI (Recommended)

```bash
# Install and configure for current project
ck statusline

# Install for a different project
ck statusline /path/to/project

# Skip dependency validation
ck statusline --skip-deps

# Skip updating settings.json (only install script)
ck statusline --no-update-settings
```

### Option 2: Manual Installation

1. **Install the statusline script**:

```bash
# Create .claude directory in your home folder if it doesn't exist
mkdir -p ~/.claude

# Copy the statusline script
cat > ~/.claude/statusline.sh << 'EOF'
#!/bin/bash
# ClaudeKit Statusline
set -e

input=$(cat)
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name // "Unknown"')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir // "."')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
CONTEXT_USED=$(echo "$input" | jq -r '.context_window.used_percentage // 0')

# Format cost
if command -v bc >/dev/null 2>&1; then
    if (( $(echo "$COST < 1" | bc -l) )); then
        COST_FMT=$(printf "%.2f¢" $(echo "$COST * 100" | bc))
    else
        COST_FMT=$(printf "$%.3f" "$COST")
    fi
else
    COST_FMT=$(printf "$%.3f" "$COST")
fi

# Git branch
GIT_BRANCH=""
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    if [ -n "$BRANCH" ]; then
        GIT_BRANCH="| \033[38;5;208m🌿 $BRANCH\033[0m "
    fi
fi

# Context color
if command -v bc >/dev/null 2>&1; then
    if (( $(echo "$CONTEXT_USED < 50" | bc -l) )); then
        CONTEXT_COLOR="\033[38;5;82m"
    elif (( $(echo "$CONTEXT_USED < 80" | bc -l) )); then
        CONTEXT_COLOR="\033[38;5;226m"
    else
        CONTEXT_COLOR="\033[38;5;196m"
    fi
else
    CONTEXT_COLOR="\033[38;5;82m"
fi

echo -e "\033[38;5;147m[$MODEL_DISPLAY]\033[0m \033[38;5;75m📁\033[0m ${CURRENT_DIR##*/} $GIT_BRANCH| \033[38;5;177m💰 $COST_FMT\033[0m | ${CONTEXT_COLOR}🧠 ${CONTEXT_USED}%\033[0m"
EOF

# Make it executable
chmod +x ~/.claude/statusline.sh
```

2. **Update your project's settings.json**:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
```

## Dependencies

The statusline script requires:

- **jq** - JSON parser for bash
  ```bash
  brew install jq  # macOS
  ```
- **git** - Version control (usually pre-installed)
- **bc** - Basic calculator for float arithmetic (usually pre-installed)

## Customization

### Changing Colors

The statusline uses ANSI color codes. You can customize colors by modifying the escape sequences:

```bash
# Model name (purple)
\033[38;5;147m

# Directory emoji (cyan)
\033[38;5;75m

# Git branch (orange)
\033[38;5;208m

# Cost (pink)
\033[38;5;177m

# Context usage (green/yellow/red based on percentage)
\033[38;5;82m   # green (< 50%)
\033[38;5;226m  # yellow (50-80%)
\033[38;5;196m  # red (> 80%)
```

### Adding Information

You can add more information by parsing additional fields from the JSON input. Available fields:

```json
{
  "model": {
    "id": "claude-opus-4-1",
    "display_name": "Opus"
  },
  "workspace": {
    "current_dir": "/path/to/project",
    "project_dir": "/path/to/project"
  },
  "cost": {
    "total_cost_usd": 0.0123,
    "total_duration_ms": 45000,
    "total_api_duration_ms": 2300,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "context_window": {
    "total_input_tokens": 15234,
    "total_output_tokens": 4521,
    "used_percentage": 42.5,
    "remaining_percentage": 57.5
  },
  "version": "1.0.80"
}
```

## Troubleshooting

### Statusline doesn't appear

1. Check that the script is executable:
   ```bash
   ls -la ~/.claude/statusline.sh
   # Should show: -rwxr-xr-x
   ```

2. Test the script manually:
   ```bash
   echo '{"model":{"display_name":"Sonnet"},"workspace":{"current_dir":"/tmp"},"cost":{"total_cost_usd":0},"context_window":{"used_percentage":0}}' | ~/.claude/statusline.sh
   ```

3. Check settings.json syntax:
   ```bash
   cat .claude/settings.json | jq .
   ```

4. Restart Claude Code

### Colors not displaying

Colors require terminal support. If you see escape codes like `\033[38;5;147m` instead of colors:
- Your terminal may not support ANSI colors
- Try removing `-e` flag from echo command

### Git branch not showing

- Ensure you're in a git repository
- Check git is installed: `git --version`
- Verify git commands work: `git branch --show-current`

## Examples

### Minimal Statusline

For a simpler display, create `~/.claude/statusline-minimal.sh`:

```bash
#!/bin/bash
input=$(cat)
MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
echo "[$MODEL] ${DIR##*/}"
```

### Developer-Focused Statusline

Show more development metrics:

```bash
#!/bin/bash
input=$(cat)
MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
LINES_ADDED=$(echo "$input" | jq -r '.cost.total_lines_added // 0')
LINES_REMOVED=$(echo "$input" | jq -r '.cost.total_lines_removed // 0')
echo "[$MODEL] ${DIR##*/} | +$LINES_ADDED -$LINES_REMOVED"
```

## Integration with ClaudeKit

The statusline is automatically configured for new projects created with:

```bash
ck new my-project
```

The kit template includes the statusline configuration in `kits/default/.claude/settings.json`.

## See Also

- [Claude Code Statusline Documentation](https://code.claude.com/docs/en/statusline)
- [CLI Commands](./cli-commands.md)
- [Configuration Guide](./configuration.md)
