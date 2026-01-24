import fs from 'node:fs';
import path from 'node:path';
import { getPreservedFiles } from './preserve-list.js';

/** Summary of synced files */
export interface SyncResult {
  updated: string[];
  added: string[];
  removed: string[];
  skipped: string[];
}

/**
 * Check if a file should be preserved (not overwritten)
 */
export function shouldPreserveFile(filename: string): boolean {
  return getPreservedFiles().has(filename);
}

/**
 * Check if a path contains a preserved file
 */
export function isPathPreserved(relativePath: string): boolean {
  const basename = path.basename(relativePath);
  return shouldPreserveFile(basename);
}

/**
 * Sync kit files to project directory
 * Copies all files from kit to project, skipping preserved files
 */
export function syncKitFiles(kitPath: string, projectPath: string, subdir: string = '.claude'): SyncResult {
  const result: SyncResult = {
    updated: [],
    added: [],
    removed: [],
    skipped: []
  };

  const kitSrcDir = path.join(kitPath, subdir);
  const projectDestDir = path.join(projectPath, subdir);

  if (!fs.existsSync(kitSrcDir)) {
    throw new Error(`Kit source directory not found: ${kitSrcDir}`);
  }

  if (!fs.existsSync(projectDestDir)) {
    throw new Error(`Project .claude directory not found: ${projectDestDir}`);
  }

  // Get all kit files recursively
  const kitFiles = getAllFiles(kitSrcDir);

  // Get all project files recursively
  const projectFiles = new Set(getAllFiles(projectDestDir));

  // Copy/update kit files
  for (const kitFile of kitFiles) {
    const relativePath = path.relative(kitSrcDir, kitFile);

    // Skip preserved files
    if (isPathPreserved(relativePath)) {
      result.skipped.push(relativePath);
      continue;
    }

    const destPath = path.join(projectDestDir, relativePath);
    const exists = projectFiles.has(destPath);

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(kitFile, destPath);

    if (exists) {
      result.updated.push(relativePath);
    } else {
      result.added.push(relativePath);
    }
  }

  return result;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}
