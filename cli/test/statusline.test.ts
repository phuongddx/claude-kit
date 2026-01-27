import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { statuslineCommand } from '../src/commands/statusline.js';
import { directoryExists } from '../src/services/file-operations/scanner.js';

// Mock console methods to avoid cluttering test output
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

describe('statuslineCommand', () => {
  let tempDir: string;
  let tempClaudeDir: string;

  beforeEach(() => {
    // Create temporary directories for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claudekit-test-'));
    tempClaudeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-home-'));

    // Mock console methods
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
  });

  afterEach(() => {
    // Clean up temporary directories
    if (directoryExists(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    if (directoryExists(tempClaudeDir)) {
      fs.rmSync(tempClaudeDir, { recursive: true, force: true });
    }

    // Restore console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });

  test('should create .claude directory if it does not exist', async () => {
    const targetPath = tempDir;
    const claudeDir = path.join(targetPath, '.claude');

    // Ensure .claude directory doesn't exist
    expect(directoryExists(claudeDir)).toBe(false);

    // Run statusline command (will fail but should create directory)
    try {
      await statuslineCommand(targetPath, { skipDeps: true, updateSettings: true });
    } catch {
      // Command may fail due to missing dependencies, but directory should be created
    }

    // Check that .claude directory was created
    expect(directoryExists(claudeDir)).toBe(true);
  });

  test('should create settings.json if it does not exist', async () => {
    const targetPath = tempDir;
    const settingsPath = path.join(targetPath, '.claude', 'settings.json');

    // Ensure settings.json doesn't exist
    expect(fs.existsSync(settingsPath)).toBe(false);

    // Run statusline command
    try {
      await statuslineCommand(targetPath, { skipDeps: true, updateSettings: true });
    } catch {
      // Command may fail due to missing dependencies
    }

    // Check that settings.json was created
    expect(fs.existsSync(settingsPath)).toBe(true);

    // Verify settings.json content
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    expect(settings.statusLine).toBeDefined();
    expect(settings.statusLine.type).toBe('command');
    expect(settings.statusLine.command).toBe('~/.claude/statusline.sh');
    expect(settings.statusLine.padding).toBe(0);
  });

  test('should update existing settings.json', async () => {
    const targetPath = tempDir;
    const claudeDir = path.join(targetPath, '.claude');
    const settingsPath = path.join(claudeDir, 'settings.json');

    // Create .claude directory
    fs.mkdirSync(claudeDir, { recursive: true });

    // Create existing settings.json
    const existingSettings = {
      hooks: {
        PostToolUse: [],
      },
      permissions: {
        allow: ['Bash(npm run test)'],
      },
    };
    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));

    // Run statusline command
    try {
      await statuslineCommand(targetPath, { skipDeps: true, updateSettings: true });
    } catch {
      // Command may fail due to missing dependencies
    }

    // Verify settings.json was updated
    const updatedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    expect(updatedSettings.statusLine).toBeDefined();
    expect(updatedSettings.hooks).toBeDefined(); // Existing hooks should be preserved
    expect(updatedSettings.permissions).toBeDefined(); // Existing permissions should be preserved
  });

  test('should not overwrite existing statusline configuration', async () => {
    const targetPath = tempDir;
    const claudeDir = path.join(targetPath, '.claude');
    const settingsPath = path.join(claudeDir, 'settings.json');

    // Create .claude directory
    fs.mkdirSync(claudeDir, { recursive: true });

    // Create existing settings.json with statusline
    const existingSettings = {
      statusLine: {
        type: 'command',
        command: 'custom/script.sh',
        padding: 1,
      },
    };
    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));

    const originalSettings = fs.readFileSync(settingsPath, 'utf-8');

    // Run statusline command
    try {
      await statuslineCommand(targetPath, { skipDeps: true, updateSettings: true });
    } catch {
      // Command may fail due to missing dependencies
    }

    // Verify settings.json was not modified
    const updatedSettings = fs.readFileSync(settingsPath, 'utf-8');
    expect(updatedSettings).toBe(originalSettings);
  });
});
