import * as p from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { resolveKitPath } from '../services/path-resolver.js';
import { installKit } from '../domains/installation/index.js';
import { directoryExists } from '../services/file-operations/scanner.js';
import { logger } from '../shared/logger.js';
import type { NewOptions } from '../types/index.js';

/**
 * Create a new project with ClaudeKit
 */
export async function newCommand(projectName: string, options: NewOptions = {}): Promise<void> {
  p.intro('ClaudeKit New Project');

  try {
    const projectPath = path.resolve(process.cwd(), projectName);

    // Check if project already exists
    if (directoryExists(projectPath) && !options.force) {
      const shouldContinue = await p.confirm({
        message: 'Directory already exists. Continue anyway?',
        initialValue: false
      });

      if (!shouldContinue) {
        p.cancel('Project creation cancelled');
        process.exit(0);
      }
    }

    // Create project directory
    if (!directoryExists(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    // Initialize git repo
    const { execSync } = await import('node:child_process');
    try {
      execSync('git init', { cwd: projectPath, stdio: 'pipe' });
    } catch {
      // Git is optional
    }

    // Get kit path
    const kitPath = resolveKitPath();

    if (!directoryExists(kitPath)) {
      logger.error(`Kit directory not found: ${kitPath}`);
      logger.info(`Set ${process.env.CLAUDEKIT_PATH ? 'CLAUDEKIT_PATH' : 'default kit path'} to a valid directory`);
      process.exit(1);
    }

    const s = p.spinner();
    s.start('Creating project...');

    // Install kit
    installKit(kitPath, projectPath);

    // Create basic files
    const readmePath = path.join(projectPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, `# ${projectName}\n`);
    }

    const gitignorePath = path.join(projectPath, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, 'node_modules/\n.env\ndist/\n');
    }

    s.stop('Project created successfully');

    logger.success(`Created ${projectName} at ${projectPath}`);
    logger.info(`  cd ${projectName}`);
    p.outro('Happy coding!');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
