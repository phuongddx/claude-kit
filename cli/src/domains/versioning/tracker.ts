/**
 * Version tracking system for ClaudeKit.
 * Tracks file changes, creates backups, and enables rollback.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { FileVersion, FileChangeDetection, BackupMetadata } from '../../types/index.js';
import type { KitMetadata } from '../../types/index.js';

/**
 * Version tracker configuration.
 */
export interface VersionTrackerConfig {
  /** Project root path */
  projectPath: string;
  /** Backup directory path */
  backupDir?: string;
}

/**
 * File change with hash.
 */
export interface FileChange extends FileVersion {
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
}

/**
 * Version tracker for file change detection and backup.
 */
export class VersionTracker {
  private config: VersionTrackerConfig;
  private backupDir: string;

  constructor(config: VersionTrackerConfig) {
    this.config = config;
    this.backupDir = config.backupDir || path.join(config.projectPath, '.claude', 'backups');
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
   * Create a backup of current files.
   */
  async createBackup(): Promise<string> {
    const backupId = `backup-${Date.now()}`;
    const backupPath = path.join(this.backupDir, backupId);

    // Ensure backup directory exists
    fs.mkdirSync(backupPath, { recursive: true });

    const claudeDir = path.join(this.config.projectPath, '.claude');
    if (!fs.existsSync(claudeDir)) {
      return backupId;
    }

    // Copy all files to backup
    const copyDir = (srcPath: string, destPath: string) => {
      if (!fs.existsSync(srcPath)) {
        return;
      }

      fs.mkdirSync(destPath, { recursive: true });
      const entries = fs.readdirSync(srcPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip backups directory to avoid infinite recursion
        if (entry.isDirectory() && entry.name === 'backups') {
          continue;
        }

        const srcFullPath = path.join(srcPath, entry.name);
        const destFullPath = path.join(destPath, entry.name);

        if (entry.isDirectory()) {
          copyDir(srcFullPath, destFullPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcFullPath, destFullPath);
        }
      }
    };

    copyDir(claudeDir, backupPath);

    // Create backup metadata
    const metadata: BackupMetadata = {
      id: backupId,
      createdAt: new Date().toISOString(),
      files: this.getFileVersions(),
    };

    const metadataPath = path.join(this.backupDir, `${backupId}.metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return backupId;
  }

  /**
   * Get current file versions.
   */
  private getFileVersions(): FileVersion[] {
    const versions: FileVersion[] = [];
    const hashes = this.scanCurrentFiles();
    const now = new Date().toISOString();

    for (const [filePath, hash] of Object.entries(hashes)) {
      versions.push({
        path: filePath,
        hash,
        version: this.getFileVersion(hash),
        modifiedAt: now,
      });
    }

    return versions;
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

  /**
   * List all available backups.
   */
  listBackups(): BackupMetadata[] {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const backups: BackupMetadata[] = [];
    const entries = fs.readdirSync(this.backupDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.metadata.json')) {
        const metadataPath = path.join(this.backupDir, entry.name);
        try {
          const content = fs.readFileSync(metadataPath, 'utf-8');
          backups.push(JSON.parse(content) as BackupMetadata);
        } catch {
          // Skip invalid metadata files
        }
      }
    }

    return backups.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get backup metadata by ID.
   */
  getBackup(backupId: string): BackupMetadata | null {
    const metadataPath = path.join(this.backupDir, `${backupId}.metadata.json`);

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(content) as BackupMetadata;
    } catch {
      return null;
    }
  }

  /**
   * Delete a backup.
   */
  deleteBackup(backupId: string): boolean {
    const backupPath = path.join(this.backupDir, backupId);
    const metadataPath = path.join(this.backupDir, `${backupId}.metadata.json`);

    try {
      if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath, { recursive: true, force: true });
      }
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a version tracker for a project.
 */
export function createVersionTracker(config: VersionTrackerConfig): VersionTracker {
  return new VersionTracker(config);
}
