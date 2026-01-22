import fs from 'node:fs';
import path from 'node:path';
import { KitMetadata } from '../../types/index.js';
import { kitMetadataSchema } from './schema.js';
import { METADATA_FILE, CLAUDE_DIR } from '../../shared/constants.js';

/**
 * Read kit metadata from project
 */
export function readMetadata(projectPath: string): KitMetadata | null {
  const metadataPath = path.join(projectPath, CLAUDE_DIR, METADATA_FILE);

  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    const parsed = JSON.parse(content);
    return kitMetadataSchema.parse(parsed);
  } catch {
    return null;
  }
}

/**
 * Write kit metadata to project
 */
export function writeMetadata(projectPath: string, metadata: KitMetadata): void {
  const claudeDir = path.join(projectPath, CLAUDE_DIR);

  // Ensure .claude directory exists
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  const metadataPath = path.join(claudeDir, METADATA_FILE);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Check if project is already initialized
 */
export function isProjectInitialized(projectPath: string): boolean {
  return readMetadata(projectPath) !== null;
}
