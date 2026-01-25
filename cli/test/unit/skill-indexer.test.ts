/**
 * Unit tests for skill indexer.
 */

import { describe, it, expect } from 'bun:test';
import { SkillIndexer, createSkillIndexer } from '../../src/services/skill-indexer';

describe('SkillIndexer', () => {
  describe('constructor', () => {
    it('should create a skill indexer', () => {
      const indexer = createSkillIndexer({ kitPath: '/mock/kit' });

      expect(indexer).toBeInstanceOf(SkillIndexer);
    });
  });

  describe('discoverSkills', () => {
    it('should return empty array for non-existent path', () => {
      const indexer = createSkillIndexer({ kitPath: '/nonexistent/path/12345' });

      const skills = indexer.discoverSkills();

      expect(skills).toEqual([]);
    });

    it('should cache discovered skills', () => {
      const indexer = createSkillIndexer({ kitPath: '/nonexistent/path/12345' });

      const first = indexer.discoverSkills();
      const second = indexer.discoverSkills();

      expect(first).toEqual(second);
    });
  });

  describe('getSkill', () => {
    it('should return undefined for non-existent skill', () => {
      const indexer = createSkillIndexer({ kitPath: '/nonexistent/path/12345' });

      const skill = indexer.getSkill('nonexistent');

      expect(skill).toBeUndefined();
    });
  });

  describe('getCategories', () => {
    it('should return empty array for non-existent path', () => {
      const indexer = createSkillIndexer({ kitPath: '/nonexistent/path/12345' });

      const categories = indexer.getCategories();

      expect(categories).toEqual([]);
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', () => {
      const indexer = createSkillIndexer({ kitPath: '/nonexistent/path/12345' });

      indexer.discoverSkills();
      indexer.clearCache();

      // Should not throw
      indexer.discoverSkills();
    });
  });
});
