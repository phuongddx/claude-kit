import * as p from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { directoryExists } from '../services/file-operations/scanner.js';
import { logger } from '../shared/logger.js';
import type { StatuslineOptions } from '../types/index.js';

/**
 * Statusline script content
 */
const STATUSLINE_SCRIPT = `#!/bin/bash
# ClaudeKit Statusline
# Displays: Model | Project | Git Branch | Cost | Context %

set -e

# Read JSON input from stdin
input=$(cat)

# Extract values using jq
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name // "Unknown"')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir // "."')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
CONTEXT_USED=$(echo "$input" | jq -r '.context_window.used_percentage // 0')

# Format cost (show cents if < $1)
if command -v bc >/dev/null 2>&1; then
    if (( $(echo "$COST < 1" | bc -l) )); then
        COST_FMT=$(printf "%.2f¢" $(echo "$COST * 100" | bc))
    else
        COST_FMT=$(printf "$%.3f" "$COST")
    fi
else
    # Fallback if bc is not available
    COST_FMT=$(printf "$%.3f" "$COST")
fi

# Show git branch if in a git repo
GIT_BRANCH=""
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    if [ -n "$BRANCH" ]; then
        GIT_BRANCH="| \\033[38;5;208m🌿 $BRANCH\\033[0m "
    fi
fi

# Context color (green < 50%, yellow < 80%, red >= 80%)
if command -v bc >/dev/null 2>&1; then
    if (( $(echo "$CONTEXT_USED < 50" | bc -l) )); then
        CONTEXT_COLOR="\\033[38;5;82m"
    elif (( $(echo "$CONTEXT_USED < 80" | bc -l) )); then
        CONTEXT_COLOR="\\033[38;5;226m"
    else
        CONTEXT_COLOR="\\033[38;5;196m"
    fi
else
    CONTEXT_COLOR="\\033[38;5;82m"
fi

# Output status line with colors
echo -e "\\033[38;5;147m[$MODEL_DISPLAY]\\033[0m \\033[38;5;75m📁\\033[0m \${CURRENT_DIR##*/} $GIT_BRANCH| \\033[38;5;177m💰 $COST_FMT\\033[0m | \${CONTEXT_COLOR}🧠 \${CONTEXT_USED}%\\033[0m"
`;

/**
 * ClaudeKit settings.json statusline configuration
 */
const STATUSLINE_CONFIG = {
  statusLine: {
    type: 'command',
    command: '~/.claude/statusline.sh',
    padding: 0,
  },
};

/**
 * Install the statusline script to ~/.claude/
 */
async function installStatuslineScript(): Promise<boolean> {
  const claudeDir = path.join(os.homedir(), '.claude');
  const scriptPath = path.join(claudeDir, 'statusline.sh');

  try {
    // Create .claude directory if it doesn't exist
    if (!directoryExists(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }

    // Write the statusline script
    fs.writeFileSync(scriptPath, STATUSLINE_SCRIPT, { mode: 0o755 });

    logger.success(`Installed statusline script to ${scriptPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to install statusline script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Update settings.json with statusline configuration
 */
async function updateSettingsJson(targetPath: string): Promise<boolean> {
  const settingsPath = path.join(targetPath, '.claude', 'settings.json');

  try {
    // Check if settings.json exists
    if (!fs.existsSync(settingsPath)) {
      logger.info(`No settings.json found at ${settingsPath}`);
      logger.info('Creating new settings.json with statusline configuration...');

      // Create .claude directory if it doesn't exist
      const claudeDir = path.join(targetPath, '.claude');
      if (!directoryExists(claudeDir)) {
        fs.mkdirSync(claudeDir, { recursive: true });
      }

      // Write new settings.json
      fs.writeFileSync(settingsPath, JSON.stringify(STATUSLINE_CONFIG, null, 2));
      logger.success(`Created ${settingsPath}`);
      return true;
    }

    // Read existing settings
    const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
    const settings = JSON.parse(settingsContent);

    // Check if statusline is already configured
    if (settings.statusLine) {
      logger.info('Statusline already configured in settings.json');
      return true;
    }

    // Add statusline configuration
    const updatedSettings = {
      ...settings,
      ...STATUSLINE_CONFIG,
    };

    // Write updated settings
    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2) + '\n');
    logger.success(`Updated ${settingsPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to update settings.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Validate dependencies (jq, bc, git)
 */
function validateDependencies(): boolean {
  const missing: string[] = [];

  // Check for jq
  try {
    const result = Bun.spawnSync(['jq', '--version']);
    if (result.exitCode !== 0) {
      missing.push('jq');
    }
  } catch {
    missing.push('jq');
  }

  // Check for git
  try {
    const result = Bun.spawnSync(['git', '--version']);
    if (result.exitCode !== 0) {
      missing.push('git');
    }
  } catch {
    missing.push('git');
  }

  if (missing.length > 0) {
    logger.warn(`Missing dependencies: ${missing.join(', ')}`);
    logger.info('Install with: brew install ' + missing.join(' '));
    return false;
  }

  return true;
}

/**
 * Statusline command - Install and configure custom statusline
 */
export async function statuslineCommand(targetPath: string = '.', options: StatuslineOptions = {}): Promise<void> {
  p.intro('ClaudeKit Statusline Setup');

  try {
    // Validate dependencies unless skipped
    if (!options.skipDeps) {
      const depsOk = validateDependencies();
      if (!depsOk) {
        const shouldContinue = await p.confirm({
          message: 'Some dependencies are missing. Continue anyway?',
          initialValue: false,
        });

        if (!shouldContinue) {
          p.cancel('Setup cancelled');
          process.exit(0);
        }
      }
    }

    // Install the statusline script
    const s = p.spinner();
    s.start('Installing statusline script...');

    const scriptInstalled = await installStatuslineScript();

    if (!scriptInstalled) {
      s.stop('Failed to install statusline script');
      process.exit(1);
    }

    s.stop('Statusline script installed');

    // Update settings.json if requested
    if (options.updateSettings !== false) {
      const s2 = p.spinner();
      s2.start('Updating settings.json...');

      const settingsUpdated = await updateSettingsJson(targetPath);

      if (!settingsUpdated) {
        s2.stop('Failed to update settings.json');
        process.exit(1);
      }

      s2.stop('Settings.json updated');
    }

    // Show success message
    logger.success('Statusline configured successfully');
    p.note(
      'Your statusline will now show:\n' +
      '  • Model name (Opus/Sonnet/Haiku)\n' +
      '  • Current directory\n' +
      '  • Git branch\n' +
      '  • Session cost\n' +
      '  • Context window usage\n\n' +
      'Restart Claude Code to see the statusline.',
      'Statusline Features'
    );

    p.outro('Happy coding!');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
