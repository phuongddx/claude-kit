import fs from 'node:fs';
import path from 'node:path';

/**
 * Copy a file from source to destination
 */
export function copyFile(srcPath: string, destPath: string): void {
  const destDir = path.dirname(destPath);

  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(srcPath, destPath);
}

/**
 * Copy directory recursively from source to destination
 */
export function copyDirectory(srcDir: string, destDir: string): void {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

/**
 * Copy kit files to target project
 */
export function copyKitFiles(kitPath: string, targetPath: string, subdir: string = '.claude'): void {
  const kitSrcDir = path.join(kitPath, subdir);

  if (!fs.existsSync(kitSrcDir)) {
    throw new Error(`Kit source directory not found: ${kitSrcDir}`);
  }

  copyDirectory(kitSrcDir, path.join(targetPath, subdir));
}
