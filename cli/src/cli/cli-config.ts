import cac from 'cac';
import { CLI_NAME, CLI_VERSION } from '../shared/constants.js';
import { initCommand } from '../commands/init.js';
import { newCommand } from '../commands/new.js';
import { updateCommand } from '../commands/update.js';
import { versionCommand } from '../commands/version.js';
import { resolveKitPath, resolveProjectRoot } from '../services/path-resolver.js';
import { findCommandFile, getCommandMetadata, formatCommandDescription } from '../services/command-metadata.js';

/**
 * Get command description with argument hint
 */
function getCommandDescription(commandName: string, defaultDescription: string): string {
  try {
    const kitPath = resolveKitPath();
    const projectRoot = resolveProjectRoot();
    const commandFile = findCommandFile(commandName, kitPath, projectRoot);

    if (commandFile) {
      const metadata = getCommandMetadata(commandFile);
      if (metadata) {
        return formatCommandDescription(metadata);
      }
    }
  } catch {
    // Fallback to default description
  }

  return defaultDescription;
}

/**
 * Create and configure CLI instance
 */
export function createCli() {
  const cli = cac(CLI_NAME);

  // Version option
  cli.version(CLI_VERSION);

  // Init command
  cli.command('[path]', getCommandDescription('init', 'Initialize an existing project with ClaudeKit'))
    .alias('init')
    .action(async (path: string = '.') => {
      await initCommand(path);
    });

  // New command
  cli.command('new [name]', getCommandDescription('new', 'Create a new project with ClaudeKit'))
    .option('-f, --force', 'Force overwrite existing files')
    .action(async (name: string, options: { force?: boolean }) => {
      await newCommand(name, { force: options.force });
    });

  // Update command
  cli.command('update [path]', getCommandDescription('update', 'Update existing project with latest kit files'))
    .action(async (path: string = '.') => {
      await updateCommand(path);
    });

  // Help as fallback
  cli.help();

  return cli;
}
