import * as p from '@clack/prompts';
import { resolveAbsolutePath, resolveKitPath } from '../services/path-resolver.js';
import { updateKit } from '../domains/updater/index.js';
import { updateMetadata, isProjectInitialized } from '../domains/config/index.js';
import { directoryExists } from '../services/file-operations/scanner.js';
import { logger } from '../shared/logger.js';
import type { UpdateOptions } from '../types/index.js';
import { createVersionTracker } from '../domains/versioning/tracker.js';
import { createRollbackManager } from '../domains/versioning/rollback.js';

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

    // Dry run mode - preview changes without applying
    if (options.dryRun) {
      const s = p.spinner();
      s.start('Analyzing changes...');

      const tracker = createVersionTracker({ projectPath: absolutePath });
      const changes = tracker.detectChanges('latest');

      s.stop('Dry run complete');

      if (changes.added.length > 0) {
        logger.info(`Would add ${changes.added.length} file(s):`);
        for (const file of changes.added) {
          logger.info(`  + ${file}`);
        }
      }
      if (changes.modified.length > 0) {
        logger.info(`Would modify ${changes.modified.length} file(s):`);
        for (const file of changes.modified) {
          logger.info(`  ~ ${file}`);
        }
      }
      if (changes.deleted.length > 0) {
        logger.warn(`Would delete ${changes.deleted.length} file(s):`);
        for (const file of changes.deleted) {
          logger.warn(`  - ${file}`);
        }
      }
      if (changes.unchanged.length > 0) {
        logger.info(`${changes.unchanged.length} file(s) unchanged`);
      }

      p.outro('Dry run complete - no changes made');
      return;
    }

    // Create backup before update (unless disabled)
    let backupId: string | undefined;
    if (options.backup !== false) {
      const s = p.spinner();
      s.start('Creating backup...');
      const tracker = createVersionTracker({ projectPath: absolutePath });
      backupId = await tracker.createBackup();
      s.stop(`Backup created: ${backupId}`);
    }

    const s = p.spinner();
    s.start('Updating kit files...');

    // Sync kit files
    const result = updateKit(kitPath, absolutePath);

    // Update metadata with version tracking
    updateMetadata(absolutePath);

    // Update file versions
    const tracker = createVersionTracker({ projectPath: absolutePath });
    tracker.updateFileVersions('latest');

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

    if (backupId) {
      logger.info(`Backup ID: ${backupId}`);
      logger.info(`To rollback: ck rollback ${backupId}`);
    }

    p.outro('Update complete!');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
