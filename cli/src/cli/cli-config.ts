import cac from 'cac';
import { CLI_NAME, CLI_VERSION } from '../shared/constants.js';
import { initCommand } from '../commands/init.js';
import { newCommand } from '../commands/new.js';
import { updateCommand } from '../commands/update.js';
import { versionCommand } from '../commands/version.js';
import { gitCmCommand } from '../commands/git-commit.js';
import { gitCpCommand } from '../commands/git-push.js';
import { gitPrCommand } from '../commands/git-pr.js';
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

  // Git commit command
  cli.command('git:commit [path]', 'Stage and commit changes with conventional commits')
    .alias('git:cm')
    .option('-m, --message <msg>', 'Commit message')
    .option('-a, --all', 'Stage all modified files')
    .option('--no-verify', 'Skip hooks')
    .action(async (path: string = '.', options: { message?: string; all?: boolean; noVerify?: boolean }) => {
      await gitCmCommand(path, options);
    });

  // Git commit and push command
  cli.command('git:push [path]', 'Commit changes and push to remote')
    .alias('git:cp')
    .option('-m, --message <msg>', 'Commit message')
    .option('-a, --all', 'Stage all modified files')
    .option('-f, --force', 'Force push (requires confirmation)')
    .option('--no-verify', 'Skip hooks')
    .action(async (path: string = '.', options: { message?: string; all?: boolean; force?: boolean; noVerify?: boolean }) => {
      await gitCpCommand(path, options);
    });

  // Git pull request command
  cli.command('git:pr [path]', 'Create GitHub pull request from current branch')
    .option('--base <branch>', 'Base branch')
    .option('--draft', 'Create as draft')
    .option('--title <title>', 'PR title')
    .action(async (path: string = '.', options: { base?: string; draft?: boolean; title?: string }) => {
      await gitPrCommand(path, options);
    });

  // Help as fallback
  cli.help();

  return cli;
}
