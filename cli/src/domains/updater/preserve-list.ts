/**
 * Enhanced file preservation system with pattern matching.
 * Supports exact path, glob patterns, and directory-based preservation.
 */

import type { PreserveRule, PreserveRuleType, PreserveStrategy } from '../../types/index.js';
import { minimatch } from 'minimatch';

/**
 * Default preservation rules for ClaudeKit projects.
 * These files/directories should never be overwritten during updates.
 */
export const DEFAULT_PRESERVE_RULES: PreserveRule[] = [
  // Core configuration files (exact match)
  {
    type: 'exact',
    pattern: 'metadata.json',
    strategy: 'keep',
  },
  {
    type: 'exact',
    pattern: 'settings.local.json',
    strategy: 'keep',
  },

  // User customizations (directory match)
  {
    type: 'directory',
    pattern: 'agents/local',
    strategy: 'keep',
  },
  {
    type: 'directory',
    pattern: 'commands/local',
    strategy: 'keep',
  },
  {
    type: 'directory',
    pattern: 'skills/local',
    strategy: 'keep',
  },

  // Documentation (glob pattern)
  {
    type: 'glob',
    pattern: '**/*.local.md',
    strategy: 'keep',
  },
];

/**
 * User-specific preserve rules loaded from settings.
 */
let userRules: PreserveRule[] = [];

/**
 * Set custom user preservation rules.
 */
export function setUserPreserveRules(rules: PreserveRule[]): void {
  userRules = rules;
}

/**
 * Get all preservation rules (default + user).
 */
export function getPreserveRules(): PreserveRule[] {
  return [...DEFAULT_PRESERVE_RULES, ...userRules];
}

/**
 * Add a new preservation rule.
 */
export function addPreserveRule(rule: PreserveRule): void {
  userRules.push(rule);
}

/**
 * Remove preservation rules by pattern.
 */
export function removePreserveRule(pattern: string): void {
  userRules = userRules.filter((rule) => rule.pattern !== pattern);
}

/**
 * Check if a file path matches a preserve rule.
 */
export function matchesPreserveRule(filePath: string, rules: PreserveRule[] = getPreserveRules()): boolean {
  return rules.some((rule) => matchesRule(filePath, rule));
}

/**
 * Check if a file path matches a specific rule.
 */
function matchesRule(filePath: string, rule: PreserveRule): boolean {
  const normalizedPath = filePath.replace(/^\/+/, ''); // Remove leading slashes

  switch (rule.type) {
    case 'exact':
      // Exact basename match
      const basename = normalizedPath.split('/').pop() || normalizedPath;
      return basename === rule.pattern || normalizedPath === rule.pattern;

    case 'glob':
      // Glob pattern matching
      try {
        return minimatch(normalizedPath, rule.pattern, { dot: true });
      } catch {
        return false;
      }

    case 'directory':
      // Directory prefix match
      return (
        normalizedPath.startsWith(rule.pattern + '/') ||
        normalizedPath === rule.pattern
      );

    default:
      return false;
  }
}

/**
 * Get the preservation strategy for a file path.
 */
export function getPreserveStrategy(
  filePath: string,
  rules: PreserveRule[] = getPreserveRules()
): PreserveStrategy | null {
  for (const rule of rules) {
    if (matchesRule(filePath, rule)) {
      return rule.strategy;
    }
  }
  return null;
}

/**
 * Filter a list of files to only those that should be preserved.
 */
export function filterPreservedFiles(filePaths: string[]): string[] {
  return filePaths.filter((path) => matchesPreserveRule(path));
}

/**
 * Filter a list of files to only those that can be overwritten.
 */
export function filterWritableFiles(filePaths: string[]): string[] {
  return filePaths.filter((path) => !matchesPreserveRule(path));
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use matchesPreserveRule instead.
 */
export function getPreservedFiles(): Set<string> {
  return new Set(DEFAULT_PRESERVE_RULES.map((rule) => rule.pattern));
}
