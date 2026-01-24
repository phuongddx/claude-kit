import fs from 'node:fs';
import path from 'node:path';

/** Command metadata from frontmatter */
export interface CommandMetadata {
  title: string;
  description: string;
  agent?: string;
  argumentHint?: string;
}

/** Frontmatter parsed result */
interface FrontmatterResult {
  data: Record<string, unknown>;
  content: string;
}

/**
 * Convert kebab-case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Parse YAML frontmatter from markdown content
 * Extracts the YAML block between --- markers
 */
function parseFrontmatter(content: string): FrontmatterResult | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const yamlContent = match[1];
  const markdownContent = match[2];

  const data: Record<string, unknown> = {};

  // Simple YAML parser for key-value pairs
  for (const line of yamlContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = toCamelCase(trimmed.slice(0, colonIndex).trim());
    const rawValue = trimmed.slice(colonIndex + 1).trim();
    let value: unknown = rawValue;

    // Handle quoted strings
    if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
      value = rawValue.slice(1, -1);
    }
    // Handle boolean values
    else if (rawValue === 'true') {
      value = true;
    } else if (rawValue === 'false') {
      value = false;
    }
    // Handle arrays (simple case: comma-separated values)
    else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      value = rawValue.slice(1, -1).split(',').map((v: string) => v.trim());
    }

    data[key] = value;
  }

  return { data, content: markdownContent };
}

/**
 * Get command metadata from command .md file
 */
export function getCommandMetadata(commandPath: string): CommandMetadata | null {
  if (!fs.existsSync(commandPath)) {
    return null;
  }

  const content = fs.readFileSync(commandPath, 'utf-8');
  const result = parseFrontmatter(content);

  if (!result) {
    return null;
  }

  const { data } = result;

  return {
    title: String(data.title || ''),
    description: String(data.description || ''),
    agent: data.agent ? String(data.agent) : undefined,
    argumentHint: data.argumentHint ? String(data.argumentHint) : undefined
  };
}

/**
 * Format command description with argument hint
 * Returns description as-is if it already contains hint emoji,
 * otherwise appends argument hint if it exists
 */
export function formatCommandDescription(metadata: CommandMetadata): string {
  const { description, argumentHint } = metadata;

  // If description already contains hint emoji, return as-is
  if (description.includes('👉👉👉')) {
    return description;
  }

  if (!argumentHint) {
    return description;
  }

  return `${description} ${argumentHint}`;
}

/**
 * Find command file by command name
 * Searches in CLI project directory first, then kit directory
 */
export function findCommandFile(commandName: string, kitPath: string, projectRoot?: string): string | null {
  // Search in CLI project directory first
  const root = projectRoot || process.cwd();
  const projectPaths = [
    path.join(root, '.claude', 'commands', 'ck', `${commandName}.md`),
    path.join(root, '.claude', 'commands', `${commandName}.md`),
    path.join(root, '.claude', 'commands', 'claude', `${commandName}.md`),
  ];

  // Search in kit directory
  const kitPaths = [
    path.join(kitPath, '.claude', 'commands', `${commandName}.md`),
    path.join(kitPath, '.claude', 'commands', 'core', `${commandName}.md`),
    path.join(kitPath, '.claude', 'commands', 'git', `${commandName}.md`),
    path.join(kitPath, '.claude', 'commands', 'fix', `${commandName}.md`),
  ];

  const possiblePaths = [...projectPaths, ...kitPaths];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}
