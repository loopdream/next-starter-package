#!/usr/bin/env ts-node
import path from 'path';
import os from 'os';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';

import {
  // nextJSInstall,
  setupGit,
  setupHusky,
  goodbye,
  installAndConfigurePrettier,
  configureEslint,
  installAndConfigureCypress,
  installAndConfigureJestRTL,
  oops,
} from './functions.js';

import { MESSAGES , ESLINTRC } from './constants.js';

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
    const { execa } = await import('execa');

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

    /* INSTALL NEXT **/ 

    try {
      console.log(`\n`); // line break

      await execa(
        `npx`,
        [
          `create-next-app@latest`,
          root,
          '--ts',
          '--eslint',
          '--src-dir',
          '--import-alias',
          '--use-npm',
          `--use-${useYarn ? 'yarn' : 'npm'}`,
          '--tailwind',
          false,
          '--app',
          useNextAppRouter ?? false,
        ],
        {
          stdio: 'inherit',
        }
      );

      console.log(MESSAGES.done);
    } catch (error: unknown) {
      console.log(oops);
      throw new Error(`\n${MESSAGES.nextJs.error} ${error}`);
    }




    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';


    /* INSTALL DEPENDANCIES **/ 


    try {
 
      console.log('Installing Dependancies');
  
      await execa(
        pkgMgr,
        [
          pkgMgrCmd,
          `-D`,
          // eslint
          `eslint-plugin-testing-library`,
          // prettier
          `prettier`,
          `eslint-config-prettier`,
          // Testing Libraries
          `@testing-library/jest-dom`,
          `@testing-library/user-event`,
          `@types/testing-library__jest-dom`,
          `jest @testing-library/react`,
          `jest-environment-jsdom`,
          `@typescript-eslint/eslint-plugin`,
          `cypress`,
        ],
        {
          stdio: 'inherit',
          cwd: root,
        }
      );
  
      console.log('Installed Dependancies');
  
      console.log(MESSAGES.done);
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }


    /* CONFIGURE ESLINT **/ 

    try {
  
      console.log(MESSAGES.esLintPrettier.install);
  
      await execa(pkgMgr, [pkgMgrCmd, `-D`, `@typescript-eslint/eslint-plugin`], {
        stdio: 'inherit',
        cwd: root,
      });
  
      console.log(MESSAGES.done, MESSAGES.esLintPrettier.eslintrc);
  
      await fs.promises.writeFile(
        path.join(root, '.eslintrc.json'),
        JSON.stringify(ESLINTRC, null, 2) + os.EOL
      );
  
      console.log(MESSAGES.done);
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }


    const args = { root, useYarn };

    await configureEslint(args);
    await installAndConfigurePrettier(args);
    await setupGit(root);
    await setupHusky(args);
    await installAndConfigureJestRTL(args);
    await installAndConfigureCypress(args);
  });

program.parse();
