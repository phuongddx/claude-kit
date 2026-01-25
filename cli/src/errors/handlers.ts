/**
 * Error handling utilities for ClaudeKit.
 */

import type { ClaudeKitError } from './base.js';
import { wrapError } from './base.js';

/**
 * Error handler configuration.
 */
export interface ErrorHandlerConfig {
  /** Whether to show full stack traces */
  verbose: boolean;
  /** Whether to use colored output */
  color: boolean;
  /** Log file path (optional) */
  logFile?: string;
}

/**
 * Default error handler configuration.
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  verbose: false,
  color: process.stdout.isTTY,
};

/**
 * Handle an error and display appropriate output.
 */
export function handleError(
  error: unknown,
  config: Partial<ErrorHandlerConfig> = {}
): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const claudeKitError = wrapError(error, 'ERR_UNKNOWN', 'An unknown error occurred');

  // Display error
  if (finalConfig.color) {
    console.error(claudeKitError.format());
  } else {
    console.error(`Error [${claudeKitError.code}]: ${claudeKitError.message}`);
    if (finalConfig.verbose && claudeKitError.stack) {
      console.error('\nStack trace:');
      console.error(claudeKitError.stack);
    }
  }

  // Log to file if configured
  if (finalConfig.logFile) {
    logError(claudeKitError, finalConfig.logFile);
  }

  // Exit with error code
  process.exit(claudeKitError.recoverable ? 0 : 1);
}

/**
 * Log error to file.
 */
export function logError(error: ClaudeKitError, logFile: string): void {
  try {
    const fs = require('node:fs');
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...error.toJSON(),
    };
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch {
    // Silently fail if logging fails
  }
}

/**
 * Create a suggestion from an error code.
 */
export function getSuggestionForError(code: string): string[] {
  const suggestions: Record<string, string[]> = {
    ERR_GIT_NOT_FOUND: [
      'Install Git from https://git-scm.com/downloads',
      'Ensure Git is in your system PATH',
    ],
    ERR_GIT_NOT_INITIALIZED: [
      'Run `git init` in your project directory',
    ],
    ERR_GH_CLI_NOT_FOUND: [
      'Install GitHub CLI: https://cli.github.com/',
      'Or ensure it is in your system PATH',
    ],
    ERR_FILE_NOT_FOUND: [
      'Check that the file path is correct',
      'Ensure the file exists and is readable',
    ],
    ERR_DIRECTORY_NOT_FOUND: [
      'Check that the directory path is correct',
      'Create the directory if it does not exist',
    ],
    ERR_ALREADY_INITIALIZED: [
      'Use `ck update` to update an existing installation',
      'Or use --force to reinitialize',
    ],
    ERR_NOT_INITIALIZED: [
      'Run `ck init` to initialize your project',
    ],
    ERR_KIT_NOT_FOUND: [
      'Check that CLAUDEKIT_PATH environment variable is set correctly',
      'Ensure the kit directory exists',
    ],
  };

  return suggestions[code] || [];
}

/**
 * Assert a condition is true, throw error if not.
 */
export function assert(
  condition: unknown,
  message: string,
  code: string = 'ERR_ASSERTION'
): asserts condition {
  if (!condition) {
    throw new Error(`${code}: ${message}`);
  }
}
