import path from 'node:path';
import { DEFAULT_KIT_PATH, KIT_PATH_ENV_VAR } from '../shared/constants.js';

/**
 * Get the CLI installation directory (where the binary is located)
 */
function getCliDir(): string {
  const cliPath = new URL(import.meta.url).pathname;
  // This file is in cli/src/services/path-resolver.ts
  // Go up to cli/ directory: services -> src -> cli
  return path.dirname(path.dirname(path.dirname(cliPath)));
}

/**
 * Get the project root directory (parent of CLI directory)
 */
export function resolveProjectRoot(): string {
  const cliDir = getCliDir();
  // From cli/ go up to project root
  return path.resolve(cliDir, '..');
}

/**
 * Resolve kit path from environment variable or default
 *
 * Priority:
 * 1. CLAUDEKIT_PATH environment variable (absolute or relative to CWD)
 * 2. Default path relative to CLI installation directory
 *
 * Note: Default kit path is resolved relative to the CLI's parent directory
 * (e.g., if CLI is at /path/to/claude-kit/cli/, kit is at /path/to/claude-kit/kits/default)
 */
export function resolveKitPath(cwd: string = process.cwd()): string {
  const envPath = process.env[KIT_PATH_ENV_VAR];
  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.resolve(cwd, envPath);
  }
  // Resolve relative to CLI installation, not user's CWD
  const cliDir = getCliDir();
  // From cli/ go up to project root (parent of cli), then to kits/default
  return path.resolve(cliDir, '..', 'kits', 'default');
}

/**
 * Get absolute path from potentially relative path
 */
export function resolveAbsolutePath(targetPath: string, cwd: string = process.cwd()): string {
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(cwd, targetPath);
}

/**
 * Join paths safely
 */
export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}
