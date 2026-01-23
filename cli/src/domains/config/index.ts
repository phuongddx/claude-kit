import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { KitMetadata } from '../../types/index.js';
import { kitMetadataSchema, settingsSchema } from './schema.js';
import { METADATA_FILE, CLAUDE_DIR } from '../../shared/constants.js';

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

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

/**
 * Validate settings.json against Claude Code schema
 */
export function validateSettingsJson(projectPath: string): ValidationResult {
  const settingsPath = path.join(projectPath, CLAUDE_DIR, 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    return { valid: true, errors: [] };
  }

  try {
    const content = fs.readFileSync(settingsPath, 'utf-8');
    const parsed = JSON.parse(content);
    settingsSchema.parse(parsed);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    if (error instanceof SyntaxError) {
      return { valid: false, errors: [`Invalid JSON: ${error.message}`] };
    }
    return { valid: false, errors: [String(error)] };
  }
}
