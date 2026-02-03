import cac from 'cac';
import { CLI_NAME, CLI_VERSION } from '../shared/constants.js';
import { initCommand } from '../commands/init.js';
import { newCommand } from '../commands/new.js';
import { updateCommand } from '../commands/update.js';
import { versionCommand } from '../commands/version.js';
import { gitCmCommand } from '../commands/git-commit.js';
import { gitCpCommand } from '../commands/git-push.js';
import { gitPrCommand } from '../commands/git-pr.js';
import { statuslineCommand } from '../commands/statusline.js';
import { resolveKitPath, resolveProjectRoot } from '../services/path-resolver.js';
import { findCommandFile, getCommandMetadata, formatCommandDescription } from '../services/command-metadata.js';
import { createCommandRegistry, type CommandRegistry } from './command-registry.js';

/**
 * Command registry instance (lazy loaded).
 */
let registry: CommandRegistry | null = null;

/**
 * Get or create the command registry.
 */
function getRegistry(): CommandRegistry {
  if (!registry) {
    const kitPath = resolveKitPath();
    const projectRoot = resolveProjectRoot();

    registry = createCommandRegistry({
      kitPath,
      projectRoot: projectRoot || undefined,
    });
  }
  return registry;
}

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
 * Discover and register dynamic commands.
 * This is called before CLI parsing to add commands from the kit.
 */
function registerDynamicCommands(cli: any): void {
  try {
    const registry = getRegistry();
    const commands = registry.discoverCommands();

    // Only register non-core commands (core commands are manually registered)
    const coreCommandNames = ['init', 'new', 'update'];

    for (const command of commands) {
      // Skip core commands (already manually registered)
      if (coreCommandNames.includes(command.commandName)) {
        continue;
      }

      // Build command syntax
      const syntax = command.syntax;
      const description = formatCommandDescription(command.metadata);

      // Register the command
      cli.command(syntax, description)
        .action(async (...args: unknown[]) => {
          // For now, just show that the command is discovered
          console.log(`Command discovered: ${command.commandName}`);
          console.log(`Category: ${command.category}`);
          console.log(`Agent: ${command.metadata.agent || 'none'}`);
          console.log('\nThis command is defined in the kit but not yet implemented in the CLI.');
          console.log(`File: ${command.path}`);
        });

      // Register aliases
      for (const alias of command.aliases) {
        cli.command(alias, description)
          .action(async (...args: unknown[]) => {
            console.log(`Alias for: ${command.commandName}`);
          });
      }
    }
  } catch (error) {
    // Silently fail - dynamic commands are optional
    console.debug('Failed to discover dynamic commands:', error);
  }
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
    .option('-f, --force', 'Force overwrite preserved files')
    .option('--dry-run', 'Preview changes without applying them')
    .action(async (path: string = '.', options: { force?: boolean; dryRun?: boolean }) => {
      await updateCommand(path, { force: options.force, dryRun: options.dryRun });
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

  // Statusline command
  cli.command('statusline [path]', 'Install and configure custom statusline for Claude Code')
    .option('--skip-deps', 'Skip dependency validation')
    .option('--no-update-settings', 'Skip updating settings.json')
    .action(async (path: string = '.', options: { skipDeps?: boolean; updateSettings?: boolean }) => {
      await statuslineCommand(path, options);
    });

  // Register dynamic commands from kit
  registerDynamicCommands(cli);

  // Help as fallback
  cli.help();

  return cli;
}
