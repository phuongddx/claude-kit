/**
 * Rollback functionality for ClaudeKit.
 * Allows reverting to previous backup states.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { BackupMetadata } from '../../types/index.js';

/**
 * Rollback configuration.
 */
export interface RollbackConfig {
  /** Project root path */
  projectPath: string;
  /** Backup directory path */
  backupDir?: string;
}

/**
 * Rollback result.
 */
export interface RollbackResult {
  success: boolean;
  filesRestored: number;
  error?: string;
}

/**
 * Rollback manager for restoring backups.
 */
export class RollbackManager {
  private config: RollbackConfig;
  private backupDir: string;

  constructor(config: RollbackConfig) {
    this.config = config;
    this.backupDir = config.backupDir || path.join(config.projectPath, '.claude', 'backups');
  }

  /**
   * Rollback to a specific backup.
   */
  async rollback(backupId: string): Promise<RollbackResult> {
    const backupPath = path.join(this.backupDir, backupId);
    const claudeDir = path.join(this.config.projectPath, '.claude');

    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      return {
        success: false,
        filesRestored: 0,
        error: `Backup ${backupId} not found`,
      };
    }

    try {
      // Create a pre-rollback backup
      const safetyBackupId = `pre-rollback-${Date.now()}`;
      await this.createBackup(safetyBackupId);

      // Clear existing .claude directory (except backups)
      this.clearClaudeDir();

      // Restore from backup
      const filesRestored = this.restoreBackup(backupPath, claudeDir);

      return {
        success: true,
        filesRestored,
      };
    } catch (error) {
      return {
        success: false,
        filesRestored: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create a backup before rollback.
   */
  private async createBackup(backupId: string): Promise<void> {
    const backupPath = path.join(this.backupDir, backupId);
    fs.mkdirSync(backupPath, { recursive: true });

    const claudeDir = path.join(this.config.projectPath, '.claude');
    if (!fs.existsSync(claudeDir)) {
      return;
    }

    this.copyDirectory(claudeDir, backupPath);
  }

  /**
   * Clear the .claude directory (except backups).
   */
  private clearClaudeDir(): void {
    const claudeDir = path.join(this.config.projectPath, '.claude');
    if (!fs.existsSync(claudeDir)) {
      return;
    }

    const entries = fs.readdirSync(claudeDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === 'backups') {
        continue; // Don't delete backups
      }

      const fullPath = path.join(claudeDir, entry.name);

      if (entry.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else if (entry.isFile()) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  /**
   * Restore files from backup.
   */
  private restoreBackup(backupPath: string, targetPath: string): number {
    let filesRestored = 0;

    if (!fs.existsSync(backupPath)) {
      return filesRestored;
    }

    this.copyDirectory(backupPath, targetPath, () => filesRestored++);

    return filesRestored;
  }

  /**
   * Copy directory recursively.
   */
  private copyDirectory(
    src: string,
    dest: string,
    onFileCopied?: () => void
  ): void {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      // Skip backups directory when copying within .claude to avoid recursion
      if (entry.isDirectory() && entry.name === 'backups') {
        continue;
      }

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath, onFileCopied);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
        onFileCopied?.();
      }
    }
  }

  /**
   * Preview what would be restored from a backup.
   */
  previewRollback(backupId: string): string[] | null {
    const backupPath = path.join(this.backupDir, backupId);

    if (!fs.existsSync(backupPath)) {
      return null;
    }

    const files: string[] = [];
    this.scanDirectory(backupPath, '', files);

    return files;
  }

  /**
   * Scan directory for files.
   */
  private scanDirectory(dirPath: string, relativePath: string, files: string[]): void {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        this.scanDirectory(fullPath, relPath, files);
      } else if (entry.isFile()) {
        files.push(relPath);
      }
    }
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
   * Delete old backups, keeping only the most recent ones.
   */
  cleanup(keepCount: number = 5): number {
    const backups = this.listBackups();
    const toDelete = backups.slice(keepCount);

    let deleted = 0;
    for (const backup of toDelete) {
      const backupPath = path.join(this.backupDir, backup.id);
      const metadataPath = path.join(this.backupDir, `${backup.id}.metadata.json`);

      try {
        if (fs.existsSync(backupPath)) {
          fs.rmSync(backupPath, { recursive: true, force: true });
        }
        if (fs.existsSync(metadataPath)) {
          fs.unlinkSync(metadataPath);
        }
        deleted++;
      } catch {
        // Skip failed deletions
      }
    }

    return deleted;
  }
}

/**
 * Create a rollback manager for a project.
 */
export function createRollbackManager(config: RollbackConfig): RollbackManager {
  return new RollbackManager(config);
}
