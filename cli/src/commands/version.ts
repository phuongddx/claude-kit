import { CLI_NAME, CLI_VERSION } from '../shared/constants.js';

/**
 * Display CLI version
 */
export function versionCommand(): string {
  return `${CLI_NAME} v${CLI_VERSION}`;
}
