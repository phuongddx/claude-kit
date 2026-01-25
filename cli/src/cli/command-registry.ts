/**
 * Dynamic command registry for ClaudeKit.
 * Discovers and validates commands from `.claude/commands/` directories.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { CommandFile, CommandMetadata, ValidationResult } from '../types/index.js';
import { getCommandMetadata } from '../services/command-metadata.js';

/**
 * Command registry configuration.
 */
export interface CommandRegistryConfig {
  /** Kit template path */
  kitPath: string;
  /** Project root path (optional, for project-specific commands) */
  projectRoot?: string;
  /** Additional search paths for commands */
  additionalPaths?: string[];
}

/**
 * Discovered command with registration info.
 */
export interface RegisteredCommand extends CommandFile {
  /** Command name (e.g., 'init', 'new', 'update') */
  commandName: string;
  /** Full command syntax (e.g., 'new [name]', 'update [path]') */
  syntax: string;
  /** Aliases for this command */
  aliases: string[];
  /** Priority for conflicts (higher wins) */
  priority: number;
}

/**
 * Dynamic command registry.
 * Discovers commands from multiple sources and provides validation.
 */
export class CommandRegistry {
  private config: CommandRegistryConfig;
  private cache: Map<string, RegisteredCommand[]> = new Map();

  constructor(config: CommandRegistryConfig) {
    this.config = config;
  }

  /**
   * Discover all commands from configured paths.
   */
  discoverCommands(): RegisteredCommand[] {
    const cacheKey = JSON.stringify(this.config);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const commands: RegisteredCommand[] = [];

    // Search in kit commands directory
    const kitCommandsDir = path.join(this.config.kitPath, '.claude', 'commands');
    if (fs.existsSync(kitCommandsDir)) {
      commands.push(...this.scanDirectory(kitCommandsDir, 100));
    }

    // Search in project commands directory (higher priority)
    if (this.config.projectRoot) {
      const projectCommandsDir = path.join(this.config.projectRoot, '.claude', 'commands');
      if (fs.existsSync(projectCommandsDir)) {
        commands.push(...this.scanDirectory(projectCommandsDir, 200));
      }
    }

    // Search in additional paths
    for (const additionalPath of this.config.additionalPaths || []) {
      if (fs.existsSync(additionalPath)) {
        commands.push(...this.scanDirectory(additionalPath, 50));
      }
    }

    // Resolve conflicts (keep highest priority)
    const resolved = this.resolveConflicts(commands);

    this.cache.set(cacheKey, resolved);
    return resolved;
  }

  /**
   * Scan a directory for command files.
   */
  private scanDirectory(dirPath: string, priority: number): RegisteredCommand[] {
    const commands: RegisteredCommand[] = [];

    const scan = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const command = this.parseCommandFile(fullPath, priority);
          if (command) {
            commands.push(command);
          }
        }
      }
    };

    scan(dirPath);
    return commands;
  }

  /**
   * Parse a command file and extract metadata.
   */
  private parseCommandFile(filePath: string, priority: number): RegisteredCommand | null {
    try {
      const metadata = getCommandMetadata(filePath);
      if (!metadata || !metadata.title) {
        return null;
      }

      // Extract command name and category from path
      const relativePath = path.relative(
        path.join(this.config.kitPath, '.claude', 'commands'),
        filePath
      );

      // Parse category and name from path
      // e.g., 'git/commit.md' -> category='git', name='commit'
      // e.g., 'core/init.md' -> category='core', name='init'
      const parts = relativePath.split(path.sep).filter(Boolean);

      let category = 'core';
      let name = '';

      if (parts.length >= 2) {
        category = parts[0];
        name = parts[parts.length - 1].replace(/\.md$/, '');
      } else if (parts.length === 1) {
        name = parts[0].replace(/\.md$/, '');
      }

      // Build command syntax
      const syntax = this.buildCommandSyntax(category, name, metadata);

      return {
        path: filePath,
        name,
        category,
        metadata,
        commandName: name,
        syntax,
        aliases: metadata.aliases || [],
        priority,
      };
    } catch {
      return null;
    }
  }

  /**
   * Build command syntax from category, name, and metadata.
   */
  private buildCommandSyntax(category: string, name: string, metadata: CommandMetadata): string {
    // Category prefix for namespaced commands
    const prefix = category === 'core' || category === 'ck' ? '' : `${category}:`;

    // Add argument hint if available
    const args = metadata.argumentHint || '';

    return `${prefix}${name}${args ? ' ' + args : ''}`;
  }

  /**
   * Resolve conflicts between commands with the same name.
   * Keeps the command with highest priority.
   */
  private resolveConflicts(commands: RegisteredCommand[]): RegisteredCommand[] {
    const byName = new Map<string, RegisteredCommand>();

    for (const command of commands) {
      const key = command.commandName;
      const existing = byName.get(key);

      if (!existing || command.priority > existing.priority) {
        byName.set(key, command);
      }
    }

    return Array.from(byName.values());
  }

  /**
   * Validate a command's metadata.
   */
  validateCommand(command: RegisteredCommand): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!command.metadata.title) {
      errors.push('Missing required field: title');
    }
    if (!command.metadata.description) {
      errors.push('Missing required field: description');
    }

    // Syntax validation
    if (command.syntax.includes(' ')) {
      const parts = command.syntax.split(' ');
      const commandPart = parts[0];

      // Command should be lowercase with optional colon separator
      if (!/^[a-z]+(:[a-z]+)?$/.test(commandPart)) {
        warnings.push(`Command name may not follow conventions: ${commandPart}`);
      }
    }

    // Agent validation
    if (command.metadata.agent) {
      // Agent names should be lowercase with hyphens
      if (!/^[a-z][a-z0-9-]*$/.test(command.metadata.agent)) {
        warnings.push(`Agent name may not follow conventions: ${command.metadata.agent}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate all discovered commands.
   */
  validateAll(): ValidationResult & { commandResults: Array<{ command: string; result: ValidationResult }> } {
    const commands = this.discoverCommands();
    const commandResults: Array<{ command: string; result: ValidationResult }> = [];
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const command of commands) {
      const result = this.validateCommand(command);
      commandResults.push({ command: command.commandName, result });
      allErrors.push(...result.errors.map((e) => `${command.commandName}: ${e}`));
      allWarnings.push(...result.warnings.map((w) => `${command.commandName}: ${w}`));
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      commandResults,
    };
  }

  /**
   * Get commands by category.
   */
  getCommandsByCategory(category: string): RegisteredCommand[] {
    const commands = this.discoverCommands();
    return commands.filter((c) => c.category === category);
  }

  /**
   * Get command by name.
   */
  getCommand(name: string): RegisteredCommand | undefined {
    const commands = this.discoverCommands();
    return commands.find((c) => c.commandName === name);
  }

  /**
   * Clear the discovery cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a command registry for the given paths.
 */
export function createCommandRegistry(config: CommandRegistryConfig): CommandRegistry {
  return new CommandRegistry(config);
}
