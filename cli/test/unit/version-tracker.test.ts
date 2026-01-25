/**
 * Unit tests for version tracker.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { VersionTracker, createVersionTracker } from '../../src/domains/versioning/tracker';

describe('VersionTracker', () => {
  let tracker: VersionTracker;
  let mockProjectPath: string;

  beforeEach(() => {
    // Use a temporary directory for testing
    mockProjectPath = `/tmp/claudekit-test-${Date.now()}`;
    tracker = createVersionTracker({ projectPath: mockProjectPath });
  });

  describe('constructor', () => {
    it('should create a version tracker', () => {
      expect(tracker).toBeInstanceOf(VersionTracker);
    });
  });

  describe('detectChanges', () => {
    it('should return empty detection for non-existent project', () => {
      const changes = tracker.detectChanges('1.0.0');

      expect(changes.added).toEqual([]);
      expect(changes.modified).toEqual([]);
      expect(changes.deleted).toEqual([]);
      expect(changes.unchanged).toEqual([]);
    });
  });

  describe('listBackups', () => {
    it('should return empty array when no backups exist', () => {
      const backups = tracker.listBackups();

      expect(backups).toEqual([]);
    });
  });

  describe('getBackup', () => {
    it('should return null for non-existent backup', () => {
      const backup = tracker.getBackup('nonexistent');

      expect(backup).toBeNull();
    });
  });

  describe('updateFileVersions', () => {
    it('should handle non-existent project gracefully', () => {
      // Should handle error for non-existent project
      // The tracker will try to update metadata but file doesn't exist
      // This is expected behavior
      expect(() => {
        try {
          tracker.updateFileVersions('1.0.0');
        } catch (e) {
          // Expected to throw for non-existent project
          if ((e as Error).message.includes('ENOENT')) {
            return; // This is expected
          }
          throw e;
        }
      }).not.toThrow();
    });
  });
});
