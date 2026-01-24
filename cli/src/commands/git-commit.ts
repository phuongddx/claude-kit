import * as p from '@clack/prompts';
import { logger } from '../shared/logger.js';
import {
  execGit,
  getStatus,
  getDiff,
  stageFiles,
  createCommit,
  getRecentCommits,
  validateSafeToPush,
} from '../shared/git.js';
import type { GitCmOptions, GitStatus, ChangeAnalysis, ChangeCategory } from '../types/index.js';

const BLOCKED_PATTERNS = ['.env', 'secrets', '.pem', '.key', 'credentials'];

export async function gitCmCommand(targetPath: string = '.', options: GitCmOptions = {}): Promise<void> {
  p.intro('Git Commit');

  try {
    // Validate git repo
    getStatus(targetPath);

    // Get git status
    const status = getStatus(targetPath);
    const hasChanges = status.staged.length > 0 || status.modified.length > 0 || status.untracked.length > 0;

    if (!hasChanges) {
      logger.warn('No changes to commit');
      p.outro('Nothing to do');
      return;
    }

    // Show changes
    logger.info(`Branch: ${status.branch}`);
    logger.info(`Staged: ${status.staged.length}, Modified: ${status.modified.length}, Untracked: ${status.untracked.length}`);

    // Analyze changes
    const analysis = analyzeChanges(status);

    // Check for blocked files
    const blockedFiles = analysis.files.filter(f => BLOCKED_PATTERNS.some(p => f.path.includes(p)));
    if (blockedFiles.length > 0) {
      logger.warn('Potentially sensitive files detected:');
      blockedFiles.forEach(f => logger.warn(`  - ${f.path}`));
      const confirm = await p.confirm({
        message: 'Continue committing these files?',
        initialValue: false,
      });
      if (typeof confirm === 'boolean' && !confirm) {
        p.outro('Commit cancelled');
        return;
      }
    }

    // Select files to stage
    let filesToStage: string[] = [];
    if (options.all) {
      filesToStage = [...analysis.files.map(f => f.path)];
    } else if (analysis.files.length > 0) {
      const selected = await p.multiselect({
        message: 'Select files to commit:',
        options: analysis.files.map(f => ({
          value: f.path,
          label: f.path,
        })),
      });
      if (p.isCancel(selected)) {
        p.outro('Commit cancelled');
        return;
      }
      filesToStage = selected as string[];
    }

    if (filesToStage.length === 0) {
      logger.warn('No files selected');
      p.outro('Nothing to do');
      return;
    }

    // Stage files
    stageFiles(targetPath, filesToStage);

    // Generate or use custom message
    let commitMessage = options.message;
    if (!commitMessage) {
      const diff = getDiff(targetPath, true);
      const recentCommits = getRecentCommits(targetPath);
      commitMessage = await generateCommitMessage(filesToStage, diff, recentCommits, status.branch);
    }

    if (!commitMessage) {
      p.outro('Commit cancelled');
      return;
    }

    // Show diff preview
    logger.info('Commit preview:');
    logger.info(`  Message: ${commitMessage.split('\n')[0]}`);
    logger.info(`  Files: ${filesToStage.length}`);

    const confirm = await p.confirm({
      message: 'Create commit?',
      initialValue: true,
    });
    if (typeof confirm !== 'boolean' || !confirm) {
      p.outro('Commit cancelled');
      return;
    }

    // Create commit
    const result = createCommit(targetPath, commitMessage, options.noVerify);
    const hash = result.match(/[a-f0-9]{7,}/)?.[0] || 'unknown';

    logger.success(`Commit ${hash} created`);

    // Show next steps
    if (!validateSafeToPush(status.branch)) {
      logger.warn('You are on a protected branch. Consider creating a feature branch first.');
    } else {
      logger.info('Next: Use `ck git:cp` to commit and push');
    }

    p.outro('Commit complete');
  } catch (error) {
    if ((error as { message: string }).message?.includes('not a git repository')) {
      logger.error('Not a git repository. Initialize with `git init` first');
    } else {
      logger.error(error instanceof Error ? (error as Error).message : 'Unknown error');
    }
    process.exit(1);
  }
}

function analyzeChanges(status: GitStatus): ChangeAnalysis {
  const files: ChangeAnalysis['files'] = [];
  const categories: ChangeCategory[] = [];

  // Map files to FileChange type
  for (const path of status.staged) {
    files.push({ path, status: 'staged' });
  }
  for (const path of status.modified) {
    files.push({ path, status: 'modified' });
  }
  for (const path of status.untracked) {
    files.push({ path, status: 'untracked' });
  }

  // Categorize by type based on file path
  const byType = new Map<string, string[]>();
  for (const file of files) {
    const type = categorizePath(file.path);
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)!.push(file.path);
  }

  for (const [type, paths] of byType.entries()) {
    categories.push({
      type: type as ChangeCategory['type'],
      files: paths.map(p => ({ path: p, status: files.find(f => f.path === p)?.status || 'modified' })),
    });
  }

  return { files, categories };
}

function categorizePath(path: string): string {
  const lower = path.toLowerCase();

  if (lower.includes('test') || lower.includes('spec')) return 'test';
  if (lower.includes('doc') || lower.endsWith('.md')) return 'docs';
  if (lower.includes('style') || lower.endsWith('.css')) return 'style';
  if (lower.includes('config')) return 'chore';

  // Check for feature/fix keywords in path
  if (lower.includes('feat') || lower.includes('add') || lower.includes('new')) return 'feat';
  if (lower.includes('fix') || lower.includes('bug')) return 'fix';

  return 'chore';
}

async function generateCommitMessage(files: string[], diff: string, recent: string, branch: string): Promise<string> {
  // Generate suggestion based on changes
  const type = await detectCommitType(files, diff);
  const scope = await detectScope(files);

  const message = await p.text({
    message: 'Commit message:',
    placeholder: `${type}${scope ? `(${scope})` : ''}: `,
    initialValue: `${type}${scope ? `(${scope})` : ''}: `,
  });

  if (p.isCancel(message) || !message) return '';

  // Allow adding body
  const addBody = await p.confirm({
    message: 'Add commit body?',
    initialValue: false,
  });

  let fullMessage = message;
  if (addBody === true) {
    const body = await p.text({
      message: 'Commit body:',
      placeholder: 'Describe the changes in detail',
    });
    if (body && !p.isCancel(body)) {
      fullMessage = `${message}\n\n${body}`;
    }
  }

  return fullMessage;
}

async function detectCommitType(files: string[], diff: string): Promise<string> {
  // Check file names and diff content for hints
  const lower = files.map(f => f.toLowerCase()).join(' ');
  const diffLower = diff.toLowerCase();

  if (lower.includes('test') || lower.includes('spec')) return 'test';
  if (lower.includes('doc') || lower.includes('readme')) return 'docs';
  if (lower.includes('fix') || diffLower.includes('fix') || diffLower.includes('bug')) return 'fix';
  if (lower.includes('refactor') || diffLower.includes('refactor')) return 'refactor';
  if (lower.includes('add') || lower.includes('new') || lower.includes('feat')) return 'feat';

  const type = await p.select({
    message: 'Commit type:',
    options: [
      { value: 'feat', label: 'feat - New feature' },
      { value: 'fix', label: 'fix - Bug fix' },
      { value: 'docs', label: 'docs - Documentation' },
      { value: 'style', label: 'style - Code style' },
      { value: 'refactor', label: 'refactor - Code refactoring' },
      { value: 'test', label: 'test - Tests' },
      { value: 'chore', label: 'chore - Maintenance' },
    ],
  });

  return (typeof type === 'string' ? type : 'chore');
}

async function detectScope(files: string[]): Promise<string> {
  // Extract common scope from file paths
  const scopes = new Set<string>();
  for (const file of files) {
    const parts = file.split('/');
    if (parts.length > 1) {
      scopes.add(parts[0]);
    }
  }

  if (scopes.size === 1) {
    return Array.from(scopes)[0];
  }

  if (scopes.size > 1) {
    const scope = await p.text({
      message: 'Scope (optional):',
      placeholder: 'e.g., cli, commands, types',
    });
    if (p.isCancel(scope)) return '';
    return scope || '';
  }

  return '';
}
