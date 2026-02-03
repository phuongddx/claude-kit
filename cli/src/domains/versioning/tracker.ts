/**
 * Version tracking system for ClaudeKit.
 * Tracks file changes, creates backups, and enables rollback.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { FileVersion, FileChangeDetection } from '../../types/index.js';
import type { KitMetadata } from '../../types/index.js';

/**
 * Version tracker configuration.
 */
export interface VersionTrackerConfig {
  /** Project root path */
  projectPath: string;
}

/**
 * File change with hash.
 */
export interface FileChange extends FileVersion {
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
}

/**
 * Version tracker for file change detection.
 */
export class VersionTracker {
  private config: VersionTrackerConfig;

  constructor(config: VersionTrackerConfig) {
    this.config = config;
  }

  /**
   * Detect file changes by comparing current state with tracked versions.
   */
  detectChanges(kitVersion: string): FileChangeDetection {
    const metadata = this.loadMetadata();
    const trackedVersions = metadata.fileVersions || {};
    const currentVersions = this.scanCurrentFiles();

    const added: string[] = [];
    const modified: string[] = [];
    const deleted: string[] = [];
    const unchanged: string[] = [];

    // Check for new and modified files
    for (const [filePath, currentHash] of Object.entries(currentVersions)) {
      const tracked = trackedVersions[filePath];

      if (!tracked) {
        added.push(filePath);
      } else if (tracked.hash !== currentHash) {
        modified.push(filePath);
      } else {
        unchanged.push(filePath);
      }
    }

    // Check for deleted files
    for (const filePath of Object.keys(trackedVersions)) {
      if (!(filePath in currentVersions)) {
        deleted.push(filePath);
      }
    }

    return { added, modified, deleted, unchanged };
  }

  /**
   * Scan current files and compute their hashes.
   */
  private scanCurrentFiles(): Record<string, string> {
    const hashes: Record<string, string> = {};
    const claudeDir = path.join(this.config.projectPath, '.claude');

    if (!fs.existsSync(claudeDir)) {
      return hashes;
    }

    const scanDir = (dirPath: string, relativePath: string = '') => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          // Skip backup directory
          if (entry.name === 'backups') {
            continue;
          }
          scanDir(fullPath, relPath);
        } else if (entry.isFile()) {
          try {
            const content = fs.readFileSync(fullPath);
            hashes[relPath] = createHash('sha256').update(content).digest('hex');
          } catch {
            // Skip files that can't be read
          }
        }
      }
    };

    scanDir(claudeDir);
    return hashes;
  }

  /**
   * Generate a short version string from a hash.
   */
  private getFileVersion(hash: string): string {
    return hash.substring(0, 8);
  }

  /**
   * Load project metadata.
   */
  private loadMetadata(): KitMetadata {
    const metadataPath = path.join(this.config.projectPath, '.claude', 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return {
        cliVersion: '0.0.0',
        kitPath: '',
        initializedAt: '',
      };
    }

    try {
      const content = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(content) as KitMetadata;
    } catch {
      return {
        cliVersion: '0.0.0',
        kitPath: '',
        initializedAt: '',
      };
    }
  }

  /**
   * Update tracked file versions in metadata.
   */
  updateFileVersions(kitVersion: string): void {
    const metadata = this.loadMetadata();
    const hashes = this.scanCurrentFiles();
    const now = new Date().toISOString();

    const fileVersions: Record<string, FileVersion> = {};

    for (const [filePath, hash] of Object.entries(hashes)) {
      fileVersions[filePath] = {
        path: filePath,
        hash,
        version: this.getFileVersion(hash),
        modifiedAt: now,
      };
    }

    metadata.fileVersions = fileVersions;
    metadata.kitVersion = kitVersion;
    metadata.lastUpdatedAt = now;

    // Save metadata
    const metadataPath = path.join(this.config.projectPath, '.claude', 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }
}

/**
 * Create a version tracker for a project.
 */
export function createVersionTracker(config: VersionTrackerConfig): VersionTracker {
  return new VersionTracker(config);
}
