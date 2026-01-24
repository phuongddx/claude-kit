import * as p from '@clack/prompts';
import { resolveAbsolutePath, resolveKitPath } from '../services/path-resolver.js';
import { updateKit } from '../domains/updater/index.js';
import { updateMetadata, isProjectInitialized } from '../domains/config/index.js';
import { directoryExists } from '../services/file-operations/scanner.js';
import { logger } from '../shared/logger.js';
import type { UpdateOptions } from '../types/index.js';

/**
 * Update existing project with latest kit files
 */
export async function updateCommand(targetPath: string = '.', options: UpdateOptions = {}): Promise<void> {
  p.intro('ClaudeKit Update');

  try {
    const absolutePath = resolveAbsolutePath(targetPath);

    // Check if target exists
    if (!directoryExists(absolutePath)) {
      logger.error(`Target path does not exist: ${absolutePath}`);
      process.exit(1);
    }

    // Check if project is initialized
    if (!isProjectInitialized(absolutePath)) {
      logger.error(`Project is not initialized with ClaudeKit: ${absolutePath}`);
      logger.info(`Run 'ck init' or 'ck new' first`);
      process.exit(1);
    }

    // Get kit path
    const kitPath = resolveKitPath();

    if (!directoryExists(kitPath)) {
      logger.error(`Kit directory not found: ${kitPath}`);
      logger.info(`Set ${process.env.CLAUDEKIT_PATH ? 'CLAUDEKIT_PATH' : 'default kit path'} to a valid directory`);
      process.exit(1);
    }

    const s = p.spinner();
    s.start('Updating kit files...');

    // Sync kit files
    const result = updateKit(kitPath, absolutePath);

    // Update metadata
    updateMetadata(absolutePath);

    s.stop('Kit files updated');

    // Show summary
    if (result.updated.length > 0) {
      logger.success(`Updated ${result.updated.length} file(s)`);
    }
    if (result.added.length > 0) {
      logger.success(`Added ${result.added.length} file(s)`);
    }
    if (result.skipped.length > 0) {
      logger.info(`Skipped ${result.skipped.length} preserved file(s)`);
    }

    p.outro('Update complete!');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
