/**
 * Unit tests for enhanced preserve-list functionality.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  DEFAULT_PRESERVE_RULES,
  setUserPreserveRules,
  getPreserveRules,
  addPreserveRule,
  removePreserveRule,
  matchesPreserveRule,
  getPreserveStrategy,
  filterPreservedFiles,
  filterWritableFiles,
} from '../../src/domains/updater/preserve-list';

describe('preserve-list', () => {
  // Reset user rules before each test
  beforeEach(() => {
    setUserPreserveRules([]);
  });

  describe('DEFAULT_PRESERVE_RULES', () => {
    it('should have default rules for core files', () => {
      expect(DEFAULT_PRESERVE_RULES.length).toBeGreaterThan(0);

      // Check for metadata.json and settings.local.json
      const metadataRule = DEFAULT_PRESERVE_RULES.find(r => r.pattern === 'metadata.json');
      expect(metadataRule).toBeDefined();
      expect(metadataRule?.type).toBe('exact');
      expect(metadataRule?.strategy).toBe('keep');

      const settingsRule = DEFAULT_PRESERVE_RULES.find(r => r.pattern === 'settings.local.json');
      expect(settingsRule).toBeDefined();
      expect(settingsRule?.type).toBe('exact');
    });

    it('should have directory rules for local customizations', () => {
      const localAgents = DEFAULT_PRESERVE_RULES.find(r => r.pattern === 'agents/local');
      expect(localAgents?.type).toBe('directory');

      const localCommands = DEFAULT_PRESERVE_RULES.find(r => r.pattern === 'commands/local');
      expect(localCommands?.type).toBe('directory');
    });

    it('should have glob rules for .local.md files', () => {
      const globRule = DEFAULT_PRESERVE_RULES.find(r => r.pattern === '**/*.local.md');
      expect(globRule?.type).toBe('glob');
    });
  });

  describe('getPreserveRules', () => {
    it('should return default rules when no user rules set', () => {
      const rules = getPreserveRules();
      expect(rules).toEqual(DEFAULT_PRESERVE_RULES);
    });

    it('should include user rules', () => {
      setUserPreserveRules([{ type: 'exact', pattern: 'custom.json', strategy: 'keep' }]);
      const rules = getPreserveRules();
      expect(rules.length).toBe(DEFAULT_PRESERVE_RULES.length + 1);
    });
  });

  describe('addPreserveRule', () => {
    it('should add a new rule', () => {
      addPreserveRule({ type: 'exact', pattern: 'test.json', strategy: 'backup' });
      const rules = getPreserveRules();
      expect(rules.find(r => r.pattern === 'test.json')).toBeDefined();
    });
  });

  describe('removePreserveRule', () => {
    it('should remove a user rule by pattern', () => {
      addPreserveRule({ type: 'exact', pattern: 'removable.json', strategy: 'keep' });
      expect(getPreserveRules().find(r => r.pattern === 'removable.json')).toBeDefined();

      removePreserveRule('removable.json');
      expect(getPreserveRules().find(r => r.pattern === 'removable.json')).toBeUndefined();
    });
  });

  describe('matchesPreserveRule', () => {
    it('should match exact file names', () => {
      expect(matchesPreserveRule('metadata.json')).toBeTrue();
      expect(matchesPreserveRule('settings.local.json')).toBeTrue();
      expect(matchesPreserveRule('other.json')).toBeFalse();
    });

    it('should match directory prefixes', () => {
      expect(matchesPreserveRule('agents/local/custom.md')).toBeTrue();
      expect(matchesPreserveRule('agents/local/subdir/file.md')).toBeTrue();
      expect(matchesPreserveRule('agents/other/file.md')).toBeFalse();
    });

    it('should match glob patterns', () => {
      expect(matchesPreserveRule('test.local.md')).toBeTrue();
      expect(matchesPreserveRule('src/docs/test.local.md')).toBeTrue();
      expect(matchesPreserveRule('test.md')).toBeFalse();
    });

    it('should match basename for exact type', () => {
      expect(matchesPreserveRule('path/to/metadata.json')).toBeTrue();
      expect(matchesPreserveRule('./metadata.json')).toBeTrue();
    });
  });

  describe('getPreserveStrategy', () => {
    it('should return the strategy for matching files', () => {
      expect(getPreserveStrategy('metadata.json')).toBe('keep');
      expect(getPreserveStrategy('agents/local/test.md')).toBe('keep');
    });

    it('should return null for non-matching files', () => {
      expect(getPreserveStrategy('other.json')).toBeNull();
    });
  });

  describe('filterPreservedFiles', () => {
    it('should return only files that match preserve rules', () => {
      const files = [
        'metadata.json',
        'settings.local.json',
        'agents/local/test.md',
        'commands/core/plan.md',
        'skills/react/SKILL.md',
      ];

      const preserved = filterPreservedFiles(files);
      expect(preserved).toEqual(['metadata.json', 'settings.local.json', 'agents/local/test.md']);
    });
  });

  describe('filterWritableFiles', () => {
    it('should return only files that do not match preserve rules', () => {
      const files = [
        'metadata.json',
        'settings.local.json',
        'agents/local/test.md',
        'commands/core/plan.md',
        'skills/react/SKILL.md',
      ];

      const writable = filterWritableFiles(files);
      expect(writable).toEqual(['commands/core/plan.md', 'skills/react/SKILL.md']);
    });
  });

  describe('user-defined rules', () => {
    it('should support custom glob patterns', () => {
      setUserPreserveRules([
        { type: 'glob', pattern: '**/config/*.json', strategy: 'merge' }
      ]);

      expect(matchesPreserveRule('config/app.json')).toBeTrue();
      expect(matchesPreserveRule('src/config/app.json')).toBeTrue();
      expect(matchesPreserveRule('other/config/app.json')).toBeTrue();
      expect(getPreserveStrategy('config/app.json')).toBe('merge');
    });

    it('should support custom exact patterns', () => {
      setUserPreserveRules([
        { type: 'exact', pattern: 'README.md', strategy: 'backup' }
      ]);

      expect(matchesPreserveRule('README.md')).toBeTrue();
      expect(getPreserveStrategy('README.md')).toBe('backup');
    });
  });
});
