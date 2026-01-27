/**
 * Agent Signature Utility
 *
 * Provides consistent agent identity branding across ClaudeKit.
 * Supports text, emoji, and color styles with platform compatibility.
 */

import process from 'node:process';

/**
 * Agent signature configuration
 */
export interface AgentConfig {
  /** Unique agent identifier */
  name: string;
  /** Text prefix for signatures (e.g., "[planner]") */
  prefix: string;
  /** Optional emoji badge */
  emoji?: string;
  /** ANSI color name */
  color?: string;
}

/**
 * Signature formatting options
 */
export interface FormatOptions {
  /** Enable ANSI color codes */
  useColors: boolean;
  /** Enable emoji badges */
  useEmoji: boolean;
  /** Running in TTY */
  isTTY: boolean;
}

/**
 * Signature style presets
 */
export type SignatureStyle = 'text' | 'emoji' | 'color' | 'full';

/**
 * ANSI color codes
 */
const ANSI_COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  teal: '\x1b[36m',
  indigo: '\x1b[38;5;141m',
  pink: '\x1b[38;5;206m',
  orange: '\x1b[38;5;208m',
} as const;

/**
 * Agent configuration registry
 */
export const AGENT_REGISTRY: Record<string, AgentConfig> = {
  planner: {
    name: 'planner',
    prefix: '[planner]',
    emoji: '🧠',
    color: 'purple',
  },
  'fullstack-developer': {
    name: 'developer',
    prefix: '[developer]',
    emoji: '🔧',
    color: 'green',
  },
  developer: {
    name: 'developer',
    prefix: '[developer]',
    emoji: '🔧',
    color: 'green',
  },
  researcher: {
    name: 'researcher',
    prefix: '[researcher]',
    emoji: '🔍',
    color: 'blue',
  },
  tester: {
    name: 'tester',
    prefix: '[tester]',
    emoji: '🧪',
    color: 'yellow',
  },
  debugger: {
    name: 'debugger',
    prefix: '[debugger]',
    emoji: '🐛',
    color: 'red',
  },
  'code-reviewer': {
    name: 'reviewer',
    prefix: '[reviewer]',
    emoji: '👁️',
    color: 'cyan',
  },
  reviewer: {
    name: 'reviewer',
    prefix: '[reviewer]',
    emoji: '👁️',
    color: 'cyan',
  },
  'git-manager': {
    name: 'git',
    prefix: '[git]',
    emoji: '📦',
    color: 'gray',
  },
  'docs-manager': {
    name: 'docs',
    prefix: '[docs]',
    emoji: '📝',
    color: 'teal',
  },
  'project-manager': {
    name: 'project',
    prefix: '[project]',
    emoji: '📁',
    color: 'indigo',
  },
  'ui-designer': {
    name: 'design',
    prefix: '[design]',
    emoji: '🎨',
    color: 'pink',
  },
  'performance-analyst': {
    name: 'perf',
    prefix: '[perf]',
    emoji: '⚡',
    color: 'orange',
  },
  'ios-developer': {
    name: 'ios',
    prefix: '[ios]',
    emoji: '📱',
    color: 'blue',
  },
};

/**
 * Detect output formatting options based on environment
 */
export function detectOutputOptions(): FormatOptions {
  const isTTY = process.stdout.isTTY === true;
  const noColor = process.env.NO_COLOR !== undefined;
  const isDumbTerm = process.env.TERM === 'dumb';
  const isCI = process.env.CI !== undefined;

  const useColors = isTTY && !noColor && !isDumbTerm && !isCI;
  const useEmoji = isTTY && process.platform !== 'win32';

  return { useColors, useEmoji, isTTY };
}

/**
 * Parse signature style from environment or config
 */
export function parseSignatureStyle(
  envStyle?: string,
  configStyle?: SignatureStyle
): SignatureStyle {
  const style = envStyle || configStyle || 'text';

  const validStyles: SignatureStyle[] = ['text', 'emoji', 'color', 'full'];

  if (validStyles.includes(style as SignatureStyle)) {
    return style as SignatureStyle;
  }

  return 'text';
}

/**
 * Get format options based on signature style
 */
export function getFormatOptionsForStyle(style: SignatureStyle): FormatOptions {
  const base = detectOutputOptions();

  switch (style) {
    case 'text':
      return { useColors: false, useEmoji: false, isTTY: base.isTTY };
    case 'emoji':
      return { useColors: false, useEmoji: true, isTTY: base.isTTY };
    case 'color':
      return { useColors: true, useEmoji: false, isTTY: base.isTTY };
    case 'full':
      return { useColors: true, useEmoji: true, isTTY: base.isTTY };
    default:
      return base;
  }
}

/**
 * Apply ANSI color to text
 */
function colorize(text: string, color: string, options: FormatOptions): string {
  if (!options.useColors || !color) return text;

  const ansiColor = ANSI_COLORS[color as keyof typeof ANSI_COLORS];
  if (!ansiColor) return text;

  return `${ansiColor}${text}${ANSI_COLORS.reset}`;
}

/**
 * Format an agent signature prefix
 */
export function formatSignature(
  agentType: string,
  options?: Partial<FormatOptions>
): string {
  const detected = detectOutputOptions();
  const opts: FormatOptions = {
    useColors: options?.useColors ?? detected.useColors,
    useEmoji: options?.useEmoji ?? detected.useEmoji,
    isTTY: options?.isTTY ?? detected.isTTY,
  };

  const config = AGENT_REGISTRY[agentType];
  if (!config) {
    return `[${agentType}]`;
  }

  let signature = '';

  // Add emoji if enabled
  if (opts.useEmoji && config.emoji) {
    signature += `${config.emoji} `;
  }

  // Add prefix with optional color
  const prefix = config.prefix;
  signature += colorize(prefix, config.color || '', opts);

  return signature;
}

/**
 * Format a message from an agent with signature
 */
export function formatAgentMessage(
  agentType: string,
  message: string,
  options?: Partial<FormatOptions>
): string {
  const signature = formatSignature(agentType, options);
  return `${signature} ${message}`;
}

/**
 * Format a completion footer for agent reports
 */
export function formatCompletionFooter(
  agentType: string,
  options?: Partial<FormatOptions>
): string {
  const config = AGENT_REGISTRY[agentType];
  if (!config) return '';

  const name = config.name;
  const detected = detectOutputOptions();
  const opts: FormatOptions = {
    useColors: options?.useColors ?? detected.useColors,
    useEmoji: options?.useEmoji ?? detected.useEmoji,
    isTTY: options?.isTTY ?? detected.isTTY,
  };

  const colored = opts.useColors
    ? colorize(name, config.color || '', opts)
    : name;

  return `---
*${colored} is a ClaudeKit agent*`;
}

/**
 * Get agent config by type
 */
export function getAgentConfig(agentType: string): AgentConfig | undefined {
  return AGENT_REGISTRY[agentType];
}

/**
 * Check if agent signatures are enabled
 */
export function areSignaturesEnabled(
  configEnabled?: boolean,
  envDisabled?: string | boolean
): boolean {
  if (envDisabled === 'true' || envDisabled === '1' || envDisabled === true) return false;
  return configEnabled !== false;
}
