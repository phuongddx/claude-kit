import { describe, test, expect, beforeEach } from 'bun:test';
import { directoryExists, fileExists } from '../src/services/file-operations/scanner.js';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';

describe('file-operations scanner', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), 'ck-test-' + Math.random().toString(36).slice(2));
    fs.mkdirSync(testDir, { recursive: true });
  });

  test('directoryExists should return true for existing directory', () => {
    expect(directoryExists(testDir)).toBe(true);
  });

  test('directoryExists should return false for non-existent directory', () => {
    expect(directoryExists(path.join(testDir, 'nonexistent'))).toBe(false);
  });

  test('fileExists should return true for existing file', () => {
    const testFile = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFile, 'test content');
    expect(fileExists(testFile)).toBe(true);
  });

  test('fileExists should return false for non-existent file', () => {
    expect(fileExists(path.join(testDir, 'nonexistent.txt'))).toBe(false);
  });

  test('fileExists should return false for directory', () => {
    expect(fileExists(testDir)).toBe(false);
  });
});
