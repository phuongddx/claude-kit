import path from 'node:path';
import { DEFAULT_KIT_PATH, KIT_PATH_ENV_VAR } from '../shared/constants.js';

/**
 * Resolve kit path from environment variable or default
 */
export function resolveKitPath(cwd: string = process.cwd()): string {
  const envPath = process.env[KIT_PATH_ENV_VAR];
  if (envPath) {
    return path.isAbsolute(envPath) ? envPath : path.resolve(cwd, envPath);
  }
  return path.resolve(cwd, DEFAULT_KIT_PATH);
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
