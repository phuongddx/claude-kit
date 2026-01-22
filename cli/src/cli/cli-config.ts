import cac from 'cac';
import { CLI_NAME, CLI_VERSION } from '../shared/constants.js';
import { initCommand } from '../commands/init.js';
import { newCommand } from '../commands/new.js';
import { versionCommand } from '../commands/version.js';

/**
 * Create and configure CLI instance
 */
export function createCli() {
  const cli = cac(CLI_NAME);

  // Version option
  cli.version(CLI_VERSION);

  // Init command
  cli.command('[path]', 'Initialize an existing project with ClaudeKit')
    .alias('init')
    .action(async (path: string = '.') => {
      await initCommand(path);
    });

  // New command
  cli.command('new [name]', 'Create a new project with ClaudeKit')
    .option('-f, --force', 'Force overwrite existing files')
    .action(async (name: string, options: { force?: boolean }) => {
      await newCommand(name, { force: options.force });
    });

  // Help as fallback
  cli.help();

  return cli;
}
