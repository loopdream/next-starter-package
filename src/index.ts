#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';
import { program } from 'commander';
import figlet from 'figlet';
import picocolors from 'picocolors';
import prompts from 'prompts';

import {
  nextJSInstall,
  configureEslintPrettier,
  setupGit,
  setupHusky,
  onPromptState,
  goodbye,
} from './functions.js';

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
    const { blue, red, green, cyan, gray } = picocolors;

    let projectDirectoryPath = projectName;

    if (options?.dev) {
      // if the dev flag is passed create a temp directory to install the dashboard
      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
      projectDirectoryPath = path.join('tmp', projectName);
    }

    const root = path.resolve(projectDirectoryPath);

    const promptOptions = await prompts([
      {
        onState: onPromptState,
        type: 'toggle',
        name: 'baselineDashboard',
        message: `Would you like to install the ${blue('baseline dashboard')}?
        
This script will:

🔧 Install the latest version of Next JS into ${cyan(
          './' + projectName
        )} with the following config:

    Typescript: ${green('yes')}
    use npm: ${green('yes')}
    tailwind: ${red('no')}
    eslint: ${green('yes')}
    src directory: ${green('yes')}
    import-alias: ${blue('default')} ${gray('"@/*"')}

🔧 Configure Typescript
🔧 Configure ESLint
🔧 Install and configure Prettier
🔧 Init git
🔧 Install and configure husky pre-commit hooks
🔧 Install and configure Jest and React Testing Library
🔧 Configure a baseline dashboard app 

All configurations are based on QuantSpark standards

Do you wish to proceed?`,
        initial: 'Yes',
        active: 'Yes',
        inactive: 'No',
      },
      {
        onState: onPromptState,
        type: 'toggle',
        name: 'nextAppRouter',
        message: `Would you like next to use ${blue('App Router')}?`,
        initial: 'Yes',
        active: 'Yes',
        inactive: 'No',
      },
    ]);

    if (!promptOptions.baselineDashboard) goodbye();

    await nextJSInstall({
      root,
      config: [
        '--ts',
        '--eslint',
        '--src-dir',
        '--import-alias',
        '--use-npm',
        '--tailwind',
        false,
        '--app',
        promptOptions?.nextAppRouter ?? false,
      ],
    });

    await configureEslintPrettier(root);
    await setupGit(root);
    await setupHusky(root);
  });

program.parse();
