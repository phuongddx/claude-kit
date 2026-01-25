/**
 * Skill indexing service for ClaudeKit.
 * Discovers and indexes all available skills.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { SkillFile, SkillMetadata } from '../types/index.js';

/**
 * Skill indexer configuration.
 */
export interface SkillIndexerConfig {
  /** Kit template path */
  kitPath: string;
  /** Project root path (optional, for project-specific skills) */
  projectRoot?: string;
  /** Additional search paths for skills */
  additionalPaths?: string[];
}

/**
 * Indexed skill with metadata.
 */
export interface IndexedSkill extends SkillFile {
  /** Skill category (directory name) */
  category: string;
  /** Activation keywords */
  keywords: string[];
  /** File patterns */
  filePatterns: string[];
  /** Dependencies */
  dependencies: string[];
}

/**
 * Skill indexer for discovering and cataloging skills.
 */
export class SkillIndexer {
  private config: SkillIndexerConfig;
  private cache: Map<string, IndexedSkill[]> = new Map();

  constructor(config: SkillIndexerConfig) {
    this.config = config;
  }

  /**
   * Discover all skills from configured paths.
   */
  discoverSkills(): IndexedSkill[] {
    const cacheKey = JSON.stringify(this.config);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const skills: IndexedSkill[] = [];

    // Search in kit skills directory
    const kitSkillsDir = path.join(this.config.kitPath, '.claude', 'skills');
    if (fs.existsSync(kitSkillsDir)) {
      skills.push(...this.scanDirectory(kitSkillsDir, 100));
    }

    // Search in project skills directory (higher priority)
    if (this.config.projectRoot) {
      const projectSkillsDir = path.join(this.config.projectRoot, '.claude', 'skills');
      if (fs.existsSync(projectSkillsDir)) {
        skills.push(...this.scanDirectory(projectSkillsDir, 200));
      }
    }

    // Search in additional paths
    for (const additionalPath of this.config.additionalPaths || []) {
      if (fs.existsSync(additionalPath)) {
        skills.push(...this.scanDirectory(additionalPath, 50));
      }
    }

    // Resolve conflicts (keep highest priority)
    const resolved = this.resolveConflicts(skills);

    this.cache.set(cacheKey, resolved);
    return resolved;
  }

  /**
   * Scan a directory for skill files.
   */
  private scanDirectory(dirPath: string, priority: number): IndexedSkill[] {
    const skills: IndexedSkill[] = [];

    const scan = (currentPath: string, category: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          scan(fullPath, entry.name);
        } else if (entry.isFile() && entry.name.toUpperCase() === 'SKILL.MD') {
          const skill = this.parseSkillFile(fullPath, category, priority);
          if (skill) {
            skills.push(skill);
          }
        }
      }
    };

    scan(dirPath, '');
    return skills;
  }

  /**
   * Parse a skill file and extract metadata.
   */
  private parseSkillFile(filePath: string, category: string, priority: number): IndexedSkill | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadata = this.extractSkillMetadata(content, filePath);
      const skillName = path.basename(path.dirname(filePath));

      return {
        path: filePath,
        name: skillName,
        metadata,
        content,
        category: category || skillName,
        keywords: metadata.activation_keywords || [],
        filePatterns: this.extractFilePatterns(content),
        dependencies: this.extractDependencies(content),
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract skill metadata from frontmatter.
   */
  private extractSkillMetadata(content: string, filePath: string): SkillMetadata {
    // Parse YAML frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);

    const metadata: SkillMetadata = {
      name: path.basename(path.dirname(filePath)),
      description: '',
      activation_keywords: [],
      tier: 'intermediate',
    };

    if (match) {
      const yamlContent = match[1];
      for (const line of yamlContent.split('\n')) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();

        switch (key) {
          case 'name':
            metadata.name = value.replace(/['"]/g, '');
            break;
          case 'description':
            metadata.description = value.replace(/['"]/g, '');
            break;
          case 'activation_keywords':
            metadata.activation_keywords = value
              .replace(/[\[\]]/g, '')
              .split(',')
              .map((v) => v.trim().toLowerCase())
              .filter(Boolean);
            break;
          case 'tier':
            metadata.tier = value.replace(/['"]/g, '') as 'beginner' | 'intermediate' | 'advanced';
            break;
          case 'color':
            metadata.color = value.replace(/['"]/g, '');
            break;
        }
      }
    }

    // Extract description from first section if not in frontmatter
    if (!metadata.description) {
      const descMatch = content.match(/## Description\s*\n([\s\S]*?)(?=\n##|\n*$)/);
      if (descMatch) {
        metadata.description = descMatch[1].trim();
      }
    }

    return metadata;
  }

  /**
   * Extract file patterns from skill content.
   */
  private extractFilePatterns(content: string): string[] {
    const patterns: string[] = [];

    // Look for "When Active" section
    const whenActiveMatch = content.match(/## When Active\s*\n([\s\S]*?)(?=\n##|\n*$)/);
    if (whenActiveMatch) {
      const text = whenActiveMatch[1];
      // Extract file extensions like .ts, .tsx, .md
      const extMatch = text.match(/\.\w+/g);
      if (extMatch) {
        patterns.push(...extMatch);
      }
    }

    return patterns;
  }

  /**
   * Extract skill dependencies from content.
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];

    // Look for "Dependencies" section
    const depsMatch = content.match(/## Dependencies\s*\n([\s\S]*?)(?=\n##|\n*$)/);
    if (depsMatch) {
      const text = depsMatch[1].toLowerCase();
      // Extract skill mentions
      const skillNames = text.match(/(\w+)(?=\s+skill)/gi);
      if (skillNames) {
        dependencies.push(...skillNames.map((s) => s.toLowerCase()));
      }
    }

    return dependencies;
  }

  /**
   * Resolve conflicts between skills with the same name.
   */
  private resolveConflicts(skills: IndexedSkill[]): IndexedSkill[] {
    const byName = new Map<string, IndexedSkill>();

    for (const skill of skills) {
      const key = skill.name;
      const existing = byName.get(key);

      if (!existing) {
        byName.set(key, skill);
      }
      // Priority is implicitly handled by scan order
    }

    return Array.from(byName.values());
  }

  /**
   * Get skill by name.
   */
  getSkill(name: string): IndexedSkill | undefined {
    const skills = this.discoverSkills();
    return skills.find((s) => s.name === name);
  }

  /**
   * Get skills by category.
   */
  getSkillsByCategory(category: string): IndexedSkill[] {
    const skills = this.discoverSkills();
    return skills.filter((s) => s.category === category);
  }

  /**
   * Get all skill categories.
   */
  getCategories(): string[] {
    const skills = this.discoverSkills();
    const categories = new Set(skills.map((s) => s.category));
    return Array.from(categories).sort();
  }

  /**
   * Clear the discovery cache.
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a skill indexer for the given paths.
 */
export function createSkillIndexer(config: SkillIndexerConfig): SkillIndexer {
  return new SkillIndexer(config);
}
