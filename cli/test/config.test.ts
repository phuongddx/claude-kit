import { describe, test, expect, beforeEach } from 'bun:test';
import { isProjectInitialized, readMetadata, writeMetadata } from '../src/domains/config/index.js';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import type { KitMetadata } from '../src/types/index.js';

describe('config domain', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), 'ck-test-' + Math.random().toString(36).slice(2));
    fs.mkdirSync(testDir, { recursive: true });
  });

  test('isProjectInitialized should return false for new project', () => {
    expect(isProjectInitialized(testDir)).toBe(false);
  });

  test('writeMetadata and readMetadata should work', () => {
    const metadata: KitMetadata = {
      cliVersion: '1.0.0',
      kitPath: '/path/to/kit',
      initializedAt: new Date().toISOString()
    };

    writeMetadata(testDir, metadata);
    expect(isProjectInitialized(testDir)).toBe(true);

    const read = readMetadata(testDir);
    expect(read).toEqual(metadata);
  });
});
