import { copyKitFiles } from './file-copier.js';
import { writeMetadata } from '../config/index.js';
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
