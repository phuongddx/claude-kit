import * as p from '@clack/prompts';
import { execSync } from 'node:child_process';
import { logger } from '../shared/logger.js';
import {
  getCurrentBranch,
  getRemoteUrl,
  getDiff,
  getDefaultBranch,
  getRecentCommits,
  checkGhInstalled,
} from '../shared/git.js';
import type { GitPrOptions } from '../types/index.js';

export async function gitPrCommand(targetPath: string = '.', options: GitPrOptions = {}): Promise<void> {
  p.intro('Create Pull Request');

  try {
    // Check if GitHub CLI is installed
    if (!checkGhInstalled()) {
      logger.error('GitHub CLI (gh) is required but not installed');
      logger.info('Install it from: https://cli.github.com');
      process.exit(1);
    }

    // Get branch info
    const currentBranch = getCurrentBranch(targetPath);
    const baseBranch = options.base || getDefaultBranch(targetPath);
    const remoteUrl = getRemoteUrl(targetPath);

    if (!remoteUrl) {
      logger.error('No remote configured');
      process.exit(1);
    }

    // Check if on main branch
    if (currentBranch === baseBranch || currentBranch === 'main' || currentBranch === 'master') {
      logger.warn(`You are on the ${currentBranch} branch. Create a feature branch first.`);
      const confirm = await p.confirm({
        message: 'Continue anyway?',
        initialValue: false,
      });
      if (typeof confirm !== 'boolean' || !confirm) {
        p.outro('PR creation cancelled');
        return;
      }
    }

    // Generate PR content
    logger.info(`Creating PR: ${currentBranch} -> ${baseBranch}`);

    const title = options.title || await generatePRTitle(targetPath, currentBranch);
    if (!title) {
      p.outro('PR creation cancelled');
      return;
    }

    const body = await generatePRDescription(targetPath, currentBranch, baseBranch);

    // Show PR preview
    logger.info('PR Preview:');
    logger.info(`  Title: ${title}`);
    logger.info(`  Base: ${baseBranch}`);
    logger.info(`  Draft: ${options.draft ? 'Yes' : 'No'}`);

    const confirm = await p.confirm({
      message: 'Create PR?',
      initialValue: true,
    });

    if (typeof confirm !== 'boolean' || !confirm) {
      p.outro('PR creation cancelled');
      return;
    }

    // Create PR using gh CLI
    const args = ['pr', 'create', '--base', baseBranch, '--title', title, '--body', body];
    if (options.draft) args.push('--draft');

    try {
      const result = execSync(`gh ${args.join(' ')}`, {
        cwd: targetPath,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // Extract PR URL from result
      const prUrlMatch = result.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/);
      const prUrl = prUrlMatch ? prUrlMatch[0] : '';

      logger.success('PR created successfully');
      if (prUrl) {
        logger.info(`URL: ${prUrl}`);
      }

      p.outro('PR created');
    } catch (error) {
      const errorMsg = (error as { stderr: string }).stderr || (error as Error).message;

      if (errorMsg.includes('no commits')) {
        logger.error('No commits to create PR from. Commit your changes first.');
      } else if (errorMsg.includes('already exists')) {
        logger.error('A PR for this branch already exists.');
      } else if (errorMsg.includes('authenticated')) {
        logger.error('GitHub authentication failed. Run `gh auth login`');
      } else {
        logger.error(`Failed to create PR: ${errorMsg}`);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function generatePRTitle(cwd: string, branch: string): Promise<string> {
  const recent = getRecentCommits(cwd, 1);
  const firstLine = recent.split('\n')[0] || '';

  // Parse conventional commit
  const match = firstLine.match(/^(\w+)(?:\(([^)]+)\))?:?\s*(.+)$/);
  if (match) {
    const [, type, scope, subject] = match;
    const prefix = scope ? `${type}(${scope}):` : `${type}:`;
    const initial = `${prefix} ${subject}`.trim();

    const title = await p.text({
      message: 'PR title:',
      initialValue: initial,
    });

    if (p.isCancel(title)) return '';
    return title || initial;
  }

  // Fallback: use branch name or prompt
  const initial = branch.replace(/^(feat|fix|docs|style|refactor|test|chore)[/-]/, '').replace(/-/g, ' ');

  const title = await p.text({
    message: 'PR title:',
    initialValue: initial,
  });

  if (p.isCancel(title)) return '';
  return title || `Merge ${branch} into main`;
}

async function generatePRDescription(cwd: string, branch: string, baseBranch: string): Promise<string> {
  const diff = getDiff(cwd, false);
  const recent = getRecentCommits(cwd, 10);

  // Build description template
  const sections: string[] = [];

  // Summary section
  const summary = await p.text({
    message: 'Summary of changes:',
    placeholder: 'Brief description of what this PR does',
  });

  if (summary && !p.isCancel(summary)) {
    sections.push(`## Summary\n${summary}`);
  }

  // Changes list
  if (recent) {
    sections.push(`## Changes\n${recent.split('\n').map(line => `- ${line}`).join('\n')}`);
  }

  // Type of change
  sections.push(`## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update`);

  // Testing
  const testing = await p.text({ message: 'Testing approach:', placeholder: 'Describe how this was tested' });
  const testingText = (typeof testing === 'string' && testing) ? testing : 'Not specified';
  sections.push(`## Testing\n${testingText}`);

  // Checklist
  sections.push(`## Checklist
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No new warnings`);

  return sections.join('\n\n');
}
