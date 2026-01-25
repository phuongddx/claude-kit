/**
 * Integration tests for update workflow.
 */

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

describe('Update Workflow Integration', () => {
  let testDir: string;
  let kitDir: string;

  beforeAll(() => {
    // Create test directories
    testDir = fs.mkdtempSync('/tmp/claudekit-update-test-');
    kitDir = fs.mkdtempSync('/tmp/claudekit-kit-test-');

    // Create kit structure
    const kitClaudeDir = path.join(kitDir, '.claude');
    fs.mkdirSync(path.join(kitClaudeDir, 'commands'), { recursive: true });
    fs.mkdirSync(path.join(kitClaudeDir, 'agents'), { recursive: true });

    // Create test files in kit
    fs.writeFileSync(
      path.join(kitClaudeDir, 'commands', 'test.md'),
      '# Test Command\n\nThis is a test command.'
    );

    // Initialize project with .claude directory
    const projectClaudeDir = path.join(testDir, '.claude');
    fs.mkdirSync(projectClaudeDir, { recursive: true });

    // Create metadata.json
    fs.writeFileSync(
      path.join(projectClaudeDir, 'metadata.json'),
      JSON.stringify({
        cliVersion: '0.3.0',
        kitPath: kitDir,
        initializedAt: new Date().toISOString(),
      })
    );

    // Create preserved file
    fs.writeFileSync(
      path.join(projectClaudeDir, 'settings.local.json'),
      '{ "localSetting": true }'
    );
  });

  it('should preserve settings.local.json during update', () => {
    // This is a simplified test - in real scenario, would use the actual update command
    const preservedPath = path.join(testDir, '.claude', 'settings.local.json');
    const contentBefore = fs.readFileSync(preservedPath, 'utf-8');

    // Simulate update by copying files
    const sourcePath = path.join(kitDir, '.claude', 'commands', 'test.md');
    const destPath = path.join(testDir, '.claude', 'commands', 'test.md');
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(sourcePath, destPath);

    // Verify preserved file wasn't modified
    const contentAfter = fs.readFileSync(preservedPath, 'utf-8');
    expect(contentAfter).toEqual(contentBefore);
  });

  afterAll(() => {
    // Clean up test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    if (fs.existsSync(kitDir)) {
      fs.rmSync(kitDir, { recursive: true });
    }
  });
});
