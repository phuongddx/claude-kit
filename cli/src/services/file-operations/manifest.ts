import fs from 'node:fs';
import { KitManifest } from '../../types/index.js';

/**
 * Read kit manifest file
 */
export function readManifest(manifestPath: string): KitManifest | null {
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content) as KitManifest;
  } catch {
    return null;
  }
}

/**
 * Write kit manifest file
 */
export function writeManifest(manifestPath: string, manifest: KitManifest): void {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
