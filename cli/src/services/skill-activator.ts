/**
 * Skill activation service for ClaudeKit.
 * Automatically activates skills based on context and input.
 */

import type { SkillActivationRule, SkillMetadata } from '../types/index.js';
import type { IndexedSkill } from './skill-indexer.js';

/**
 * Activation context.
 */
export interface ActivationContext {
  /** User input/prompt */
  userInput: string;
  /** Project files (relative paths) */
  projectFiles: string[];
  /** Current working directory */
  cwd: string;
}

/**
 * Activation result with scores.
 */
export interface ActivationResult {
  skill: IndexedSkill;
  score: number;
  reasons: string[];
}

/**
 * Skill activator for context-aware skill loading.
 */
export class SkillActivator {
  private skills: IndexedSkill[];

  constructor(skills: IndexedSkill[]) {
    this.skills = skills;
  }

  /**
   * Activate skills based on context.
   */
  activate(context: ActivationContext): ActivationResult[] {
    const results: ActivationResult[] = [];
    const inputLower = context.userInput.toLowerCase();

    for (const skill of this.skills) {
      const score = this.calculateSkillScore(skill, context);
      if (score > 0) {
        results.push({
          skill,
          score,
          reasons: this.getActivationReasons(skill, context),
        });
      }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate activation score for a skill.
   */
  private calculateSkillScore(skill: IndexedSkill, context: ActivationContext): number {
    let score = 0;
    const inputLower = context.userInput.toLowerCase();

    // Keyword matching (highest weight)
    for (const keyword of skill.keywords) {
      if (inputLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // File pattern matching
    for (const pattern of skill.filePatterns) {
      for (const file of context.projectFiles) {
        if (file.includes(pattern) || file.endsWith(pattern)) {
          score += 5;
          break; // Only count once per pattern
        }
      }
    }

    // Name matching in input
    if (inputLower.includes(skill.name.toLowerCase())) {
      score += 3;
    }

    // Category matching
    if (inputLower.includes(skill.category.toLowerCase())) {
      score += 2;
    }

    return score;
  }

  /**
   * Get reasons for skill activation.
   */
  private getActivationReasons(skill: IndexedSkill, context: ActivationContext): string[] {
    const reasons: string[] = [];
    const inputLower = context.userInput.toLowerCase();

    // Keyword matches
    const matchedKeywords = skill.keywords.filter((k) =>
      inputLower.includes(k.toLowerCase())
    );
    if (matchedKeywords.length > 0) {
      reasons.push(`Keywords matched: ${matchedKeywords.join(', ')}`);
    }

    // File pattern matches
    const matchedPatterns = skill.filePatterns.filter((pattern) =>
      context.projectFiles.some((file) => file.includes(pattern) || file.endsWith(pattern))
    );
    if (matchedPatterns.length > 0) {
      reasons.push(`File patterns matched: ${matchedPatterns.join(', ')}`);
    }

    // Name match
    if (inputLower.includes(skill.name.toLowerCase())) {
      reasons.push(`Skill name matched`);
    }

    // Category match
    if (inputLower.includes(skill.category.toLowerCase())) {
      reasons.push(`Category matched: ${skill.category}`);
    }

    return reasons;
  }

  /**
   * Resolve skill dependencies.
   */
  resolveDependencies(skills: IndexedSkill[]): IndexedSkill[] {
    const resolved: IndexedSkill[] = [...skills];
    const added = new Set<string>(skills.map((s) => s.name));

    let changed = true;
    let iterations = 0;
    const maxIterations = 10;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (const skill of skills) {
        for (const dep of skill.dependencies) {
          // Find dependency skill
          const depSkill = this.skills.find((s) => s.name === dep || s.category === dep);
          if (depSkill && !added.has(depSkill.name)) {
            resolved.push(depSkill);
            added.add(depSkill.name);
            changed = true;
          }
        }
      }
    }

    return resolved;
  }

  /**
   * Detect circular dependencies.
   */
  detectCircularDependencies(): string[][] {
    const circles: string[][] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (skill: IndexedSkill, path: string[]) => {
      if (visiting.has(skill.name)) {
        // Found a cycle
        const cycleStart = path.indexOf(skill.name);
        circles.push([...path.slice(cycleStart), skill.name]);
        return;
      }

      if (visited.has(skill.name)) {
        return;
      }

      visiting.add(skill.name);

      for (const dep of skill.dependencies) {
        const depSkill = this.skills.find((s) => s.name === dep);
        if (depSkill) {
          visit(depSkill, [...path, skill.name]);
        }
      }

      visiting.delete(skill.name);
      visited.add(skill.name);
    };

    for (const skill of this.skills) {
      visit(skill, []);
    }

    return circles;
  }

  /**
   * Get activation threshold.
   * Skills with score below threshold won't activate.
   */
  getThreshold(): number {
    return 5; // Minimum score for activation
  }

  /**
   * Filter results by threshold.
   */
  filterByThreshold(results: ActivationResult[]): ActivationResult[] {
    return results.filter((r) => r.score >= this.getThreshold());
  }
}

/**
 * Create a skill activator for the given skills.
 */
export function createSkillActivator(skills: IndexedSkill[]): SkillActivator {
  return new SkillActivator(skills);
}

/**
 * Parse skill activation rule from metadata.
 */
export function parseActivationRule(metadata: SkillMetadata): SkillActivationRule {
  return {
    keywords: metadata.activation_keywords || [],
    filePatterns: [], // Would be extracted from content
    dependencies: [], // Would be extracted from content
  };
}
