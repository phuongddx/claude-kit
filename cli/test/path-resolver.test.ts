import { describe, test, expect } from 'bun:test';
import { resolveAbsolutePath, joinPaths } from '../src/services/path-resolver.js';

describe('path-resolver', () => {
  describe('resolveAbsolutePath', () => {
    test('should return absolute path when given absolute path', () => {
      const result = resolveAbsolutePath('/usr/local/bin');
      expect(result).toBe('/usr/local/bin');
    });

    test('should resolve relative path to absolute', () => {
      const result = resolveAbsolutePath('subdir', '/home/user');
      expect(result).toBe('/home/user/subdir');
    });
  });

  describe('joinPaths', () => {
    test('should join paths correctly', () => {
      const result = joinPaths('home', 'user', 'project');
      expect(result).toMatch(/home[\/\\]user[\/\\]project/);
    });
  });
});
