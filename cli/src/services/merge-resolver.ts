/**
 * Merge resolver for handling file conflicts during updates.
 * Supports three-way merge and conflict detection.
 */

import * as diff from 'diff';
import type { MergeResult, Conflict } from '../types/index.js';

/**
 * Merge resolver configuration.
 */
export interface MergeResolverConfig {
  /** Use automatic merge for simple conflicts */
  autoMerge?: boolean;
  /** Conflict marker style */
  conflictStyle?: 'merge' | 'diff3';
}

/**
 * Three-way merge result with conflict markers.
 */
interface ThreeWayMerge {
  merged: string;
  hasConflicts: boolean;
  conflictCount: number;
}

/**
 * Merge resolver for handling file conflicts.
 */
export class MergeResolver {
  private config: MergeResolverConfig;

  constructor(config: MergeResolverConfig = {}) {
    this.config = {
      autoMerge: config.autoMerge ?? true,
      conflictStyle: config.conflictStyle ?? 'merge',
    };
  }

  /**
   * Perform a three-way merge.
   */
  threeWayMerge(base: string, local: string, remote: string): MergeResult {
    const result = this.performThreeWayMerge(base, local, remote);

    if (result.hasConflicts) {
      // Try to extract conflicts
      const conflicts = this.extractConflicts(result.merged);
      return {
        success: false,
        result: result.merged,
        conflicts,
      };
    }

    return {
      success: true,
      result: result.merged,
    };
  }

  /**
   * Perform the actual three-way merge.
   */
  private performThreeWayMerge(base: string, local: string, remote: string): ThreeWayMerge {
    // If base equals local, take remote
    if (base === local) {
      return { merged: remote, hasConflicts: false, conflictCount: 0 };
    }

    // If base equals remote, take local
    if (base === remote) {
      return { merged: local, hasConflicts: false, conflictCount: 0 };
    }

    // If local equals remote, take either
    if (local === remote) {
      return { merged: local, hasConflicts: false, conflictCount: 0 };
    }

    // Perform line-by-line merge
    return this.lineByLineMerge(base, local, remote);
  }

  /**
   * Line-by-line merge with conflict markers.
   */
  private lineByLineMerge(base: string, local: string, remote: string): ThreeWayMerge {
    const baseLines = base.split('\n');
    const localLines = local.split('\n');
    const remoteLines = remote.split('\n');

    const merged: string[] = [];
    let conflictCount = 0;

    // Simple diff-based merge
    const localDiff = diff.diffLines(base, local);
    const remoteDiff = diff.diffLines(base, remote);

    let i = 0;
    let j = 0;

    while (i < localDiff.length || j < remoteDiff.length) {
      const localChange = localDiff[i];
      const remoteChange = remoteDiff[j];

      if (!localChange) {
        // Only remote changes remain
        if (remoteChange) {
          merged.push(...remoteChange.value.split('\n'));
        }
        j++;
        continue;
      }

      if (!remoteChange) {
        // Only local changes remain
        if (localChange) {
          merged.push(...localChange.value.split('\n'));
        }
        i++;
        continue;
      }

      // Both have changes - check for conflict
      if (localChange.added || localChange.removed) {
        if (remoteChange.added || remoteChange.removed) {
          // Conflict - both sides modified
          conflictCount++;
          merged.push('<<<<<<< LOCAL');
          merged.push(...localChange.value.split('\n'));
          merged.push('======='); // Could add base lines here for diff3 style
          merged.push(...remoteChange.value.split('\n'));
          merged.push('>>>>>>> REMOTE');
        } else {
          // Only local changed
          merged.push(...localChange.value.split('\n'));
        }
        i++;
        j++;
      } else if (remoteChange.added || remoteChange.removed) {
        // Only remote changed
        merged.push(...remoteChange.value.split('\n'));
        i++;
        j++;
      } else {
        // No changes - use base line
        if (localChange.value) {
          merged.push(localChange.value);
        }
        i++;
        j++;
      }
    }

    return {
      merged: merged.join('\n'),
      hasConflicts: conflictCount > 0,
      conflictCount,
    };
  }

  /**
   * Extract conflicts from merged text.
   */
  extractConflicts(merged: string): Conflict[] {
    const conflicts: Conflict[] = [];
    const lines = merged.split('\n');

    let i = 0;
    while (i < lines.length) {
      if (lines[i].startsWith('<<<<<<< LOCAL')) {
        const start = i;
        const localLines: string[] = [];

        i++; // Skip marker
        while (i < lines.length && !lines[i].startsWith('=======')) {
          localLines.push(lines[i]);
          i++;
        }

        i++; // Skip =======
        const remoteLines: string[] = [];
        while (i < lines.length && !lines[i].startsWith('>>>>>>> REMOTE')) {
          remoteLines.push(lines[i]);
          i++;
        }

        i++; // Skip >>>>>>> REMOTE

        conflicts.push({
          path: '', // Path would be set by caller
          base: '', // Base content would be set by caller
          local: localLines.join('\n'),
          remote: remoteLines.join('\n'),
        });
      } else {
        i++;
      }
    }

    return conflicts;
  }

  /**
   * Detect if there's a conflict between local and remote.
   */
  detectConflict(local: string, remote: string): boolean {
    if (local === remote) {
      return false;
    }

    // Simple heuristic: different lengths suggest conflict
    // More sophisticated detection would use proper diff
    const localLines = local.split('\n');
    const remoteLines = remote.split('\n');

    if (Math.abs(localLines.length - remoteLines.length) > 5) {
      return true;
    }

    // Count line differences
    const maxLines = Math.max(localLines.length, remoteLines.length);
    let differences = 0;

    for (let i = 0; i < maxLines; i++) {
      const localLine = localLines[i] || '';
      const remoteLine = remoteLines[i] || '';
      if (localLine !== remoteLine) {
        differences++;
      }
    }

    // If more than 20% of lines differ, consider it a conflict
    return differences / maxLines > 0.2;
  }

  /**
   * Resolve a conflict interactively (would use prompts in real implementation).
   */
  async resolveConflictInteractively(
    conflict: Conflict
  ): Promise<string> {
    // For now, return a merged version with both sides
    // In a real implementation, this would prompt the user
    return `<<<<<<< LOCAL\n${conflict.local}\n=======\n${conflict.remote}\n>>>>>>> REMOTE`;
  }

  /**
   * Auto-resolve a conflict by choosing one side.
   */
  resolveConflictAuto(conflict: Conflict, prefer: 'local' | 'remote' | 'base'): string {
    switch (prefer) {
      case 'local':
        return conflict.local;
      case 'remote':
        return conflict.remote;
      case 'base':
        return conflict.base;
    }
  }
}

/**
 * Create a merge resolver with default configuration.
 */
export function createMergeResolver(
  config?: MergeResolverConfig
): MergeResolver {
  return new MergeResolver(config);
}
