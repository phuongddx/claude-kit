import fs from 'node:fs';
import path from 'node:path';
import { ManifestEntry } from '../../types/index.js';

/**
 * Recursively scan a directory and return file manifest
 */
export function scanDirectory(dirPath: string, basePath: string = dirPath): ManifestEntry[] {
  const manifest: ManifestEntry[] = [];

  function scan(currentPath: string): void {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        scan(fullPath);
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(basePath, fullPath);
        manifest.push({
          path: relativePath,
          size: stats.size
        });
      }
    }
  }

  scan(dirPath);
  return manifest;
}

/**
 * Check if directory exists
 */
export function directoryExists(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}
