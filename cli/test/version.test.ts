import { describe, test, expect } from 'bun:test';
import { versionCommand } from '../src/commands/version.js';
import { CLI_NAME, CLI_VERSION } from '../src/shared/constants.js';

describe('versionCommand', () => {
  test('should return version string', () => {
    const result = versionCommand();
    expect(result).toBe(`${CLI_NAME} v${CLI_VERSION}`);
  });
});
