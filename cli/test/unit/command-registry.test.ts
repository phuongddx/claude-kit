/**
 * Unit tests for command registry functionality.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { CommandRegistry, createCommandRegistry } from '../../src/cli/command-registry';

describe('CommandRegistry', () => {
  let mockKitPath: string;
  let mockProjectPath: string;

  beforeEach(() => {
    // Create mock paths
    mockKitPath = '/mock/kit';
    mockProjectPath = '/mock/project';
  });

  describe('constructor', () => {
    it('should create a registry with kit path', () => {
      const registry = new CommandRegistry({ kitPath: mockKitPath });
      expect(registry).toBeInstanceOf(CommandRegistry);
    });

    it('should create a registry with both paths', () => {
      const registry = new CommandRegistry({
        kitPath: mockKitPath,
        projectRoot: mockProjectPath,
      });
      expect(registry).toBeInstanceOf(CommandRegistry);
    });
  });

  describe('createCommandRegistry', () => {
    it('should create a CommandRegistry instance', () => {
      const registry = createCommandRegistry({ kitPath: mockKitPath });
      expect(registry).toBeInstanceOf(CommandRegistry);
    });
  });

  describe('discoverCommands', () => {
    it('should return empty array when no commands exist', () => {
      // Use a non-existent path
      const registry = new CommandRegistry({ kitPath: '/nonexistent/path/12345' });
      const commands = registry.discoverCommands();

      expect(commands).toEqual([]);
    });

    it('should cache discovered commands', () => {
      const registry = new CommandRegistry({ kitPath: '/nonexistent/path/12345' });

      // First call
      const first = registry.discoverCommands();
      // Second call (should return cached)
      const second = registry.discoverCommands();

      expect(first).toEqual(second);
    });

    it('should clear cache when requested', () => {
      const registry = new CommandRegistry({ kitPath: '/nonexistent/path/12345' });

      registry.discoverCommands();
      registry.clearCache();

      // Should not throw
      registry.discoverCommands();
    });
  });

  describe('validateCommand', () => {
    it('should pass validation for valid command', () => {
      const registry = new CommandRegistry({ kitPath: mockKitPath });

      const command = {
        path: '/test/path',
        name: 'test',
        category: 'core',
        commandName: 'test',
        syntax: 'test',
        aliases: [],
        priority: 100,
        metadata: {
          title: 'Test Command',
          description: 'A test command',
          agent: 'planner',
        },
      };

      const result = registry.validateCommand(command);

      expect(result.valid).toBeTrue();
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing title', () => {
      const registry = new CommandRegistry({ kitPath: mockKitPath });

      const command = {
        path: '/test/path',
        name: 'test',
        category: 'core',
        commandName: 'test',
        syntax: 'test',
        aliases: [],
        priority: 100,
        metadata: {
          title: '',
          description: 'A test command',
        },
      };

      const result = registry.validateCommand(command);

      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Missing required field: title');
    });

    it('should fail validation for missing description', () => {
      const registry = new CommandRegistry({ kitPath: mockKitPath });

      const command = {
        path: '/test/path',
        name: 'test',
        category: 'core',
        commandName: 'test',
        syntax: 'test',
        aliases: [],
        priority: 100,
        metadata: {
          title: 'Test Command',
          description: '',
        },
      };

      const result = registry.validateCommand(command);

      expect(result.valid).toBeFalse();
      expect(result.errors).toContain('Missing required field: description');
    });

    it('should warn for unconventional agent names', () => {
      const registry = new CommandRegistry({ kitPath: mockKitPath });

      const command = {
        path: '/test/path',
        name: 'test',
        category: 'core',
        commandName: 'test',
        syntax: 'test',
        aliases: [],
        priority: 100,
        metadata: {
          title: 'Test Command',
          description: 'A test command',
          agent: 'InvalidAgentName',
        },
      };

      const result = registry.validateCommand(command);

      expect(result.valid).toBeTrue();
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getCommand', () => {
    it('should return undefined for non-existent command', () => {
      const registry = new CommandRegistry({ kitPath: '/nonexistent/path/12345' });

      const command = registry.getCommand('nonexistent');

      expect(command).toBeUndefined();
    });
  });

  describe('getCommandsByCategory', () => {
    it('should return empty array for non-existent category', () => {
      const registry = new CommandRegistry({ kitPath: '/nonexistent/path/12345' });

      const commands = registry.getCommandsByCategory('nonexistent');

      expect(commands).toEqual([]);
    });
  });
});
