/**
 * Agent Signature Frontmatter Upgrade Script
 *
 * Upgrades all agent .md files to include emoji signatures in frontmatter.
 * Run from the cli directory: bun run src/scripts/upgrade-agent-signatures.ts
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliDir = join(__dirname, '..');
const root = join(cliDir, '..');

const AGENT_SIGNATURES = {
  'planner': { emoji: '🧠', prefix: '[planner]', name: 'planner' },
  'fullstack-developer': { emoji: '🔧', prefix: '[developer]', name: 'developer' },
  'developer': { emoji: '🔧', prefix: '[developer]', name: 'developer' },
  'researcher': { emoji: '🔍', prefix: '[researcher]', name: 'researcher' },
  'tester': { emoji: '🧪', prefix: '[tester]', name: 'tester' },
  'debugger': { emoji: '🐛', prefix: '[debugger]', name: 'debugger' },
  'code-reviewer': { emoji: '👁️', prefix: '[reviewer]', name: 'reviewer' },
  'reviewer': { emoji: '👁️', prefix: '[reviewer]', name: 'reviewer' },
  'git-manager': { emoji: '📦', prefix: '[git]', name: 'git' },
  'docs-manager': { emoji: '📝', prefix: '[docs]', name: 'docs' },
  'project-manager': { emoji: '📁', prefix: '[project]', name: 'project' },
  'ui-designer': { emoji: '🎨', prefix: '[design]', name: 'design' },
  'performance-analyst': { emoji: '⚡', prefix: '[perf]', name: 'perf' },
  'ios-developer': { emoji: '📱', prefix: '[ios]', name: 'ios' },
};

function getAgentFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(join(dir, entry.name));
      }
    }
  } catch (e) {
    // Directory doesn't exist or not accessible
  }
  return files;
}

function upgradeAgentFrontmatter(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Find frontmatter boundaries
  const startIdx = lines.indexOf('---');
  const endIdx = lines.indexOf('---', startIdx + 1);

  if (startIdx === -1 || endIdx === -1) {
    console.log(`Skipping ${filePath} - no frontmatter found`);
    return;
  }

  // Extract agent key from filename
  const filename = filePath.split('/').pop()?.replace('.md', '') || '';
  let sig = AGENT_SIGNATURES[filename as keyof typeof AGENT_SIGNATURES];

  if (!sig) {
    console.log(`No signature found for ${filename}`);
    return;
  }

  // Track if any changes were made
  let changed = false;

  // Update frontmatter lines
  const newLines = [...lines];
  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = newLines[i];

    // Update name field
    if (line.startsWith('name:')) {
      const currentName = line.split(':')[1].trim();
      // Only add emoji if not already present
      if (!currentName.startsWith(sig.emoji)) {
        newLines[i] = `name: ${sig.emoji} ${currentName}`;
        changed = true;
      }
    }

    // Update description field
    if (line.startsWith('description:')) {
      const currentDesc = line.split(':', 2)[1].trim();
      // Only add signature if not already present
      if (!currentDesc.includes(sig.prefix)) {
        newLines[i] = `description: ${sig.emoji} ${sig.prefix} - ${currentDesc}`;
        changed = true;
      }
    }

    // Add or update argument-hint if it exists
    if (line.startsWith('argument-hint:')) {
      const currentHint = line.split(':', 2)[1].trim();
      // Only add signature if not already present
      if (!currentHint.includes(sig.prefix)) {
        newLines[i] = `argument-hint: ${sig.emoji} ${sig.prefix} - ${currentHint}`;
        changed = true;
      }
    }
  }

  if (changed) {
    writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Skipped ${filePath} (already has signature)`);
  }
}

// Collect all agent files from known locations
const agentDirs = [
  join(root, '.claude/agents'),
  join(root, 'cli/.claude/agents'),
  join(root, 'kits/default/.claude/agents'),
];

const allFiles: string[] = [];
for (const dir of agentDirs) {
  allFiles.push(...getAgentFiles(dir));
}

console.log(`Found ${allFiles.length} agent files`);
allFiles.forEach(upgradeAgentFrontmatter);
console.log('Done!');
