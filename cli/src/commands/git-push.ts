import * as p from '@clack/prompts';
import { logger } from '../shared/logger.js';
import {
  getStatus,
  getCurrentBranch,
  validateSafeToPush,
  pushToRemote,
  getRemoteUrl,
} from '../shared/git.js';
import { gitCmCommand } from './git-commit.js';
import type { GitCpOptions } from '../types/index.js';

export async function gitCpCommand(targetPath: string = '.', options: GitCpOptions = {}): Promise<void> {
  p.intro('Git Commit & Push');

  try {
    // Check if remote exists
    const remoteUrl = getRemoteUrl(targetPath);
    if (!remoteUrl) {
      logger.error('No remote configured. Add a remote with `git remote add origin <url>`');
      process.exit(1);
    }

    // First, run commit workflow
    await gitCmCommand(targetPath, options);

    // Get current branch
    const branch = getCurrentBranch(targetPath);
    const status = getStatus(targetPath);

    // Check if there are still uncommitted changes (user may have cancelled)
    if (status.staged.length === 0 && status.modified.length === 0 && status.untracked.length === 0) {
      // No commit was made, nothing to push
      p.outro('No commit to push');
      return;
    }

    // Confirm push for protected branches
    if (!validateSafeToPush(branch)) {
      logger.warn(`You are about to push to protected branch: ${branch}`);

      const confirm = await p.confirm({
        message: `Push to ${branch}?`,
        initialValue: false,
      });

      if (typeof confirm !== 'boolean' || !confirm) {
        p.outro('Push cancelled');
        return;
      }
    }

    // Confirm force push if requested
    if (options.force) {
      const confirm = await p.confirm({
        message: 'Force push can rewrite history. Continue?',
        initialValue: false,
      });

      if (typeof confirm !== 'boolean' || !confirm) {
        p.outro('Push cancelled');
        return;
      }
    }

    // Push to remote
    logger.info(`Pushing to origin/${branch}...`);

    try {
      const result = pushToRemote(targetPath, branch, options.force);

      // Parse result to get commit info
      logger.success('Push successful');
      logger.info(`Branch: ${branch}`);
      logger.info(`Remote: ${remoteUrl}`);

      p.outro('Push complete');
    } catch (error) {
      const errorMsg = (error as { stderr: string }).stderr || (error as Error).message;

      if (errorMsg.includes('rejected')) {
        logger.error('Push rejected. Remote has changes you don\'t have locally.');
        logger.info('Run `git pull` first to integrate remote changes');
      } else if (errorMsg.includes('auth')) {
        logger.error('Authentication failed. Check your credentials.');
      } else {
        logger.error(`Push failed: ${errorMsg}`);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
