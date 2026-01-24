import { syncKitFiles, shouldPreserveFile, type SyncResult } from './file-syncer.js';
import { getPreservedFiles } from './preserve-list.js';

/**
 * Update kit files in existing project
 * Syncs files from kit template to project, skipping preserved files
 */
export function updateKit(kitPath: string, projectPath: string, subdir: string = '.claude'): SyncResult {
  return syncKitFiles(kitPath, projectPath, subdir);
}

export { syncKitFiles, shouldPreserveFile, getPreservedFiles };
export type { SyncResult };
