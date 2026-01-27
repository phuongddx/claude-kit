/**
 * Agent Signature Utility Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  formatSignature,
  formatAgentMessage,
  formatCompletionFooter,
  detectOutputOptions,
  parseSignatureStyle,
  getFormatOptionsForStyle,
  getAgentConfig,
  areSignaturesEnabled,
  AGENT_REGISTRY,
} from '../agent-signature';

describe('AGENT_REGISTRY', () => {
  it('should have all required agents', () => {
    const expectedAgents = [
      'planner',
      'fullstack-developer',
      'developer',
      'researcher',
      'tester',
      'debugger',
      'code-reviewer',
      'reviewer',
      'git-manager',
      'docs-manager',
      'project-manager',
      'ui-designer',
      'performance-analyst',
      'ios-developer',
    ];

    expectedAgents.forEach(agent => {
      expect(AGENT_REGISTRY[agent]).toBeDefined();
    });
  });

  it('should have required config fields for each agent', () => {
    Object.values(AGENT_REGISTRY).forEach(config => {
      expect(config.name).toBeTruthy();
      expect(config.prefix).toBeTruthy();
      expect(config.prefix).toMatch(/^\[.+\]$/);
    });
  });
});

describe('formatSignature', () => {
  it('should format text-only signature', () => {
    const result = formatSignature('planner', {
      useColors: false,
      useEmoji: false,
      isTTY: true,
    });
    expect(result).toBe('[planner]');
  });

  it('should format emoji signature', () => {
    const result = formatSignature('planner', {
      useColors: false,
      useEmoji: true,
      isTTY: true,
    });
    expect(result).toBe('🧠 [planner]');
  });

  it('should format colored signature', () => {
    const result = formatSignature('planner', {
      useColors: true,
      useEmoji: false,
      isTTY: true,
    });
    expect(result).toContain('[planner]');
    expect(result).toContain('\x1b['); // ANSI code
  });

  it('should format full signature (emoji + color)', () => {
    const result = formatSignature('planner', {
      useColors: true,
      useEmoji: true,
      isTTY: true,
    });
    expect(result).toContain('🧠');
    expect(result).toContain('[planner]');
    expect(result).toContain('\x1b['); // ANSI code
  });

  it('should handle unknown agent types', () => {
    const result = formatSignature('unknown-agent', {
      useColors: false,
      useEmoji: false,
      isTTY: true,
    });
    expect(result).toBe('[unknown-agent]');
  });

  it('should handle developer alias', () => {
    const result = formatSignature('developer', {
      useColors: false,
      useEmoji: true,
      isTTY: true,
    });
    expect(result).toBe('🔧 [developer]');
  });

  it('should handle reviewer alias', () => {
    const result = formatSignature('reviewer', {
      useColors: false,
      useEmoji: true,
      isTTY: true,
    });
    expect(result).toBe('👁️ [reviewer]');
  });
});

describe('formatAgentMessage', () => {
  it('should combine signature with message', () => {
    const result = formatAgentMessage(
      'planner',
      'Creating implementation plan...',
      {
        useColors: false,
        useEmoji: false,
        isTTY: true,
      }
    );
    expect(result).toBe('[planner] Creating implementation plan...');
  });

  it('should include emoji when enabled', () => {
    const result = formatAgentMessage('tester', 'Running tests...', {
      useColors: false,
      useEmoji: true,
      isTTY: true,
    });
    expect(result).toBe('🧪 [tester] Running tests...');
  });
});

describe('formatCompletionFooter', () => {
  it('should format footer without color', () => {
    const result = formatCompletionFooter('planner', {
      useColors: false,
      useEmoji: false,
      isTTY: true,
    });
    expect(result).toBe('---\n*planner is a ClaudeKit agent*');
  });

  it('should format footer with color', () => {
    const result = formatCompletionFooter('planner', {
      useColors: true,
      useEmoji: false,
      isTTY: true,
    });
    // Remove ANSI codes for text assertion
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '');
    expect(stripped).toContain('planner is a ClaudeKit agent*');
    expect(result).toContain('\x1b['); // ANSI code present
  });

  it('should return empty string for unknown agent', () => {
    const result = formatCompletionFooter('unknown', {
      useColors: false,
      useEmoji: false,
      isTTY: true,
    });
    expect(result).toBe('');
  });
});

describe('detectOutputOptions', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear env variables for clean test state
    delete process.env.NO_COLOR;
    delete process.env.CI;
    delete process.env.TERM;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect TTY capabilities', () => {
    const options = detectOutputOptions();
    expect(options).toHaveProperty('useColors');
    expect(options).toHaveProperty('useEmoji');
    expect(options).toHaveProperty('isTTY');
    // Check actual type since it could be undefined
    expect(typeof options.useColors).toBe('boolean');
    expect(typeof options.useEmoji).toBe('boolean');
    expect(typeof options.isTTY).toBe('boolean');
  });

  it('should respect NO_COLOR environment variable', () => {
    process.env.NO_COLOR = '1';
    const options = detectOutputOptions();
    expect(options.useColors).toBe(false);
  });

  it('should respect CI environment variable', () => {
    process.env.CI = 'true';
    const options = detectOutputOptions();
    expect(options.useColors).toBe(false);
  });

  it('should respect dumb TERM', () => {
    process.env.TERM = 'dumb';
    const options = detectOutputOptions();
    expect(options.useColors).toBe(false);
  });
});

describe('parseSignatureStyle', () => {
  it('should parse valid styles', () => {
    expect(parseSignatureStyle('text')).toBe('text');
    expect(parseSignatureStyle('emoji')).toBe('emoji');
    expect(parseSignatureStyle('color')).toBe('color');
    expect(parseSignatureStyle('full')).toBe('full');
  });

  it('should default to text for invalid styles', () => {
    expect(parseSignatureStyle('invalid')).toBe('text');
    expect(parseSignatureStyle('')).toBe('text');
  });

  it('should prefer env style over config style', () => {
    expect(parseSignatureStyle('emoji', 'text')).toBe('emoji');
  });

  it('should use config style when no env style', () => {
    expect(parseSignatureStyle(undefined, 'full')).toBe('full');
  });
});

describe('getFormatOptionsForStyle', () => {
  it('should return correct options for text style', () => {
    const options = getFormatOptionsForStyle('text');
    expect(options.useColors).toBe(false);
    expect(options.useEmoji).toBe(false);
  });

  it('should return correct options for emoji style', () => {
    const options = getFormatOptionsForStyle('emoji');
    expect(options.useColors).toBe(false);
    expect(options.useEmoji).toBe(true);
  });

  it('should return correct options for color style', () => {
    const options = getFormatOptionsForStyle('color');
    expect(options.useColors).toBe(true);
    expect(options.useEmoji).toBe(false);
  });

  it('should return correct options for full style', () => {
    const options = getFormatOptionsForStyle('full');
    expect(options.useColors).toBe(true);
    expect(options.useEmoji).toBe(true);
  });
});

describe('getAgentConfig', () => {
  it('should return config for known agent', () => {
    const config = getAgentConfig('planner');
    expect(config).toBeDefined();
    expect(config?.name).toBe('planner');
    expect(config?.prefix).toBe('[planner]');
    expect(config?.emoji).toBe('🧠');
    expect(config?.color).toBe('purple');
  });

  it('should return undefined for unknown agent', () => {
    const config = getAgentConfig('unknown');
    expect(config).toBeUndefined();
  });
});

describe('areSignaturesEnabled', () => {
  it('should be enabled by default', () => {
    expect(areSignaturesEnabled()).toBe(true);
  });

  it('should respect config disabled', () => {
    expect(areSignaturesEnabled(false)).toBe(false);
  });

  it('should respect env disabled', () => {
    expect(areSignaturesEnabled(true, '1')).toBe(false);
    expect(areSignaturesEnabled(true, 'true')).toBe(false);
  });

  it('should prioritize env over config', () => {
    expect(areSignaturesEnabled(true, '1')).toBe(false);
    expect(areSignaturesEnabled(false, '0')).toBe(false);
  });
});
