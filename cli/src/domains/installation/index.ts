import { copyKitFiles } from './file-copier.js';
import { writeMetadata, validateSettingsJson } from '../config/index.js';
import { logger } from '../../shared/logger.js';
import { KitMetadata } from '../../types/index.js';
import { CLI_VERSION } from '../../shared/constants.js';

/**
 * Install kit to target project
 */
export function installKit(
  kitPath: string,
  targetPath: string,
  kitSubdir: string = '.claude'
): KitMetadata {
  // Copy kit files
  copyKitFiles(kitPath, targetPath, kitSubdir);

  // Validate settings.json
  const validation = validateSettingsJson(targetPath);
  if (!validation.valid) {
    logger.warn(`Invalid settings.json in kit template:`);
    for (const error of validation.errors) {
      logger.warn(`  - ${error}`);
    }
  } else {
    logger.success('settings.json validated successfully');
  }

  // Create metadata
  const metadata: KitMetadata = {
    cliVersion: CLI_VERSION,
    kitPath,
    initializedAt: new Date().toISOString()
  };

  // Write metadata
  writeMetadata(targetPath, metadata);

  return metadata;
}
