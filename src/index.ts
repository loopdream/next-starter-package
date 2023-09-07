import path from 'path'
import { program } from 'commander';
import figlet from 'figlet';
import process from 'process';
import prompts from 'prompts'
import picocolors from 'picocolors'

import { PROGRAM_DESCRIPTION, SCRIPT_DESCRIPTION } from './constants.js';

import {
  log,
  nextJSInstall,
  configureEslintPrettier,
  setupGit,
  setupHusky,
} from './functions.js';

console.log(figlet.textSync('QuantSpark'), '\n\n');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onPromptState = (state: any) => {
    if (state.aborted) {
      // If we don't re-enable the terminal cursor before exiting
      // the program, the cursor will remain hidden
      process.stdout.write('\x1B[?25h')
      process.stdout.write('\n')
      process.exit(1)
    }
  }

program
  .name('qsbaseline')
  .description(PROGRAM_DESCRIPTION)
  .version(`1.0.0`)

  .command(`generate`)
  .argument(`<projectDirectory>`, `NextJS project directory`)
  .option('-d, --dev', 'development mode')
  .action(async (projectDirectory, options) => {
    log(SCRIPT_DESCRIPTION);
    let pPath = ''; 
    if (options.dev) {
      pPath = `/dev/${projectDirectory}`;
    }
    const root = path.resolve(pPath);
    console.log({root, pPath})
   
 
 
    const { blue } = picocolors;

    const next = await nextJSInstall(root);

    if (!next) return;

    const qsconfig = await prompts([{
      onState: onPromptState,
      type: 'toggle',
      name: 'eslintPrettier',
      message: `Would you like to configure ${blue('Eslint and Prettier')}?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: 'No',
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'gitHusky',
      message: `Would you like to configure ${blue('Git and Husky')}?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: 'No',
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'baselineDashboard',
      message: `Would you like to install the ${blue('baseline dashboard')}?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: 'No',
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'jestRTL',
      message: `Would you like to install and configure ${blue('Jest and React Testing Library')}?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: 'No',
    }])

  if(qsconfig.eslintPrettier) await configureEslintPrettier(root);

  if(qsconfig.gitHusky) {
    await setupGit(root);
    await setupHusky(root);
  }

  });

program.parse();
