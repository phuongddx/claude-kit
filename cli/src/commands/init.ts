import * as p from '@clack/prompts';
import fs from 'node:fs';
import { resolveAbsolutePath, resolveKitPath } from '../services/path-resolver.js';
import { installKit } from '../domains/installation/index.js';
import { isProjectInitialized } from '../domains/config/index.js';
import { directoryExists } from '../services/file-operations/scanner.js';
import { logger } from '../shared/logger.js';
import type { InitOptions } from '../types/index.js';

/**
 * Initialize an existing project with ClaudeKit
 */
export async function initCommand(targetPath: string = '.', options: InitOptions = {}): Promise<void> {
  p.intro('ClaudeKit Init');

  try {
    const absolutePath = resolveAbsolutePath(targetPath);

    // Check if target exists
    if (!directoryExists(absolutePath)) {
      logger.error(`Target path does not exist: ${absolutePath}`);
      process.exit(1);
    }

    // Check if already initialized
    if (isProjectInitialized(absolutePath) && !options.force) {
      const shouldContinue = await p.confirm({
        message: 'Project is already initialized. Continue anyway?',
        initialValue: false
      });

      if (!shouldContinue) {
        p.cancel('Init cancelled');
        process.exit(0);
      }
    }

    // Get kit path
    const kitPath = resolveKitPath();

    if (!directoryExists(kitPath)) {
      logger.error(`Kit directory not found: ${kitPath}`);
      logger.info(`Set ${process.env.CLAUDEKIT_PATH ? 'CLAUDEKIT_PATH' : 'default kit path'} to a valid directory`);
      process.exit(1);
    }

    const s = p.spinner();
    s.start('Installing ClaudeKit...');

    // Install kit
    installKit(kitPath, absolutePath);

    s.stop('ClaudeKit installed successfully');

    logger.success(`Initialized ${absolutePath}`);
    p.outro('Happy coding!');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
