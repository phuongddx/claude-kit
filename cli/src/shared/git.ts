import { execSync } from 'node:child_process';
import type { GitStatus } from '../types/index.js';

/**
 * Execute git command and return stdout
 */
export function execGit(cwd: string, args: string[]): string {
  const result = execSync(`git ${args.join(' ')}`, {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  return result.trim();
}

/**
 * Get current branch name
 */
export function getCurrentBranch(cwd: string): string {
  try {
    return execGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
  } catch {
    return 'HEAD';
  }
}

/**
 * Check if repo has uncommitted changes
 */
export function hasUncommittedChanges(cwd: string): boolean {
  try {
    const output = execGit(cwd, ['status', '--porcelain']);
    return output.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get parsed git status
 */
export function getStatus(cwd: string): GitStatus {
  const output = execGit(cwd, ['status', '--porcelain']);
  const lines = output.split('\n').filter(Boolean);
  const staged: string[] = [];
  const modified: string[] = [];
  const untracked: string[] = [];

  for (const line of lines) {
    const statusCode = line.slice(0, 2);
    const path = line.slice(3);

    if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
      staged.push(path);
    }
    if (statusCode[1] !== ' ') {
      if (statusCode === '??') {
        untracked.push(path);
      } else {
        modified.push(path);
      }
    }
  }

  return {
    staged,
    modified,
    untracked,
    branch: getCurrentBranch(cwd),
  };
}

/**
 * Get git diff output
 */
export function getDiff(cwd: string, staged = false): string {
  const args = ['diff', '--no-color'];
  if (staged) args.push('--staged');
  return execGit(cwd, args);
}

/**
 * Get remote URL (for PR creation)
 */
export function getRemoteUrl(cwd: string): string | null {
  try {
    return execGit(cwd, ['config', '--get', 'remote.origin.url']);
  } catch {
    return null;
  }
}

/**
 * Check if branch is safe to push (warn for protected branches)
 */
export function validateSafeToPush(branch: string): boolean {
  const protectedBranches = ['main', 'master', 'release', 'production'];
  return !protectedBranches.includes(branch);
}

/**
 * Check if GitHub CLI is installed
 */
export function checkGhInstalled(): boolean {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Stage files
 */
export function stageFiles(cwd: string, files: string[]): void {
  if (files.length === 0) return;
  execGit(cwd, ['add', ...files]);
}

/**
 * Create commit with message
 */
export function createCommit(cwd: string, message: string, noVerify = false): string {
  const args = ['commit', '-m', message];
  if (noVerify) args.push('--no-verify');
  return execGit(cwd, args);
}

/**
 * Push to remote
 */
export function pushToRemote(cwd: string, branch: string, force = false): string {
  const args = ['push'];
  if (force) args.push('--force-with-lease');
  args.push('origin', branch);
  return execGit(cwd, args);
}

/**
 * Get default branch name
 */
export function getDefaultBranch(cwd: string): string {
  try {
    return execGit(cwd, ['config', 'init.defaultBranch']) || 'main';
  } catch {
    return 'main';
  }
}

/**
 * Get recent commits
 */
export function getRecentCommits(cwd: string, count = 5): string {
  try {
    return execGit(cwd, ['log', '--oneline', `-${count.toString()}`]);
  } catch {
    return '';
  }
}
