#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';

import {
  nextJSInstall,
  setupGit,
  setupHusky,
  goodbye,
  installAndConfigurePrettier,
  configureEslint,
  installAndConfigureCypress,
  installAndConfigureRTL,
} from './functions.js';

import { installDashboardPrompt, configurationPrompts } from './prompts.js';

console.log('\n', figlet.textSync('QuantSpark'), '\n\n');

program
  .name('qsbaseline')
  .description(
    `Generate a QuantSpark baseline Next.js app with best practace feature set`
  )
  .version(`1.0.0`)
  .usage('<projectName> -- [options]')
  .argument('<projectName>')
  .option('-d, --dev', 'my test option')
  .action(async (projectName, options) => {
    let projectDirectoryPath = projectName;

    if (options?.dev) {
      // if the dev flag is passed create a temp directory for the project installation
      // this is for testing as otherwise we would pollute the root dir
      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
      projectDirectoryPath = path.join('tmp', projectName);
    }

    const root = path.resolve(projectDirectoryPath);

    const { installDashboard } = await installDashboardPrompt(projectName);

    if (!installDashboard) return goodbye();

    const { useYarn, useNextAppRouter } = await configurationPrompts();

    await nextJSInstall({
      root,
      config: [
        '--ts',
        '--eslint',
        '--src-dir', // TODO: make optional
        '--import-alias',
        '--use-npm',
        `--use-${useYarn ? 'yarn' : 'npm'}`,
        '--tailwind',
        false,
        '--app',
        useNextAppRouter ?? false,
      ],
    });

    const args = { root, useYarn };

    await configureEslint(args);
    await installAndConfigurePrettier(args);
    await setupGit(root);
    await setupHusky(args);
    await installAndConfigureRTL(args);
    await installAndConfigureCypress(args);
  });

program.parse();
