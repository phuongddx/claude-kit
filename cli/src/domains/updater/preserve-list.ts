/**
 * Files that should never be overwritten during an update.
 * These contain project-specific configuration and state.
 */
export const PRESERVED_FILES = new Set([
  'metadata.json',
  'settings.local.json'
]);

/**
 * Get the list of preserved filenames
 */
export function getPreservedFiles(): Set<string> {
  return PRESERVED_FILES;
}
