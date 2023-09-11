#!/usr/bin/env ts-node
import path from 'path';
import os from 'os';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import picocolors from 'picocolors';

import { goodbye, oops } from './functions.js';

import { ESLINTRC, PRETTERRC, JEST_CONFIG } from './configs.js';
import { MESSAGES } from './messages.js';

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
    const { cyan } = picocolors;
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

    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';

    /* INSTALL NEXT **/

    try {
      console.log(`\n`);

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
          `--use-${pkgMgr}`,
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
    } catch (error) {
      console.log(oops);
      throw new Error(`\n${MESSAGES.nextJs.error} ${error}`);
    }

    /* INSTALL DEPENDANCIES **/

    try {
      const dependancies = [
        // eslint
        `eslint-plugin-testing-library`,
        // prettier
        `prettier`,
        `eslint-config-prettier`,
        // Testing Libraries
        `jest`,
        `jest-environment-jsdom`,
        `@testing-library/jest-dom`,
        `@testing-library/user-event`,
        `@testing-library/react`,
        `@typescript-eslint/eslint-plugin`,
        `cypress`,
      ];

      const dependanciesStr = dependancies.reduce(
        (acc, dep) => acc + `- ${cyan(dep)}\n`,
        ''
      );

      console.log(
        `\n\nInstalling extra dependancies: \n${dependanciesStr}\n\n`
      );

      await execa(pkgMgr, [pkgMgrCmd, ...dependancies], {
        stdio: 'inherit',
        cwd: root,
      });

      console.log('Installed Dependancies');

      console.log(MESSAGES.done);
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }

    /* ESLINT CONFIGURATION **/

    try {
      console.log(MESSAGES.esLintPrettier.install);

      await fs.promises.writeFile(
        path.join(root, '.eslintrc.json'),
        JSON.stringify(ESLINTRC, null, 2) + os.EOL
      );

      console.log(MESSAGES.done);
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }

    /* PRETTIER CONFIGURATION  **/

    try {
      await fs.promises.writeFile(
        path.join(root, '.prettierrc.json'),
        JSON.stringify(PRETTERRC, null, 2) + os.EOL
      );

      console.log(MESSAGES.done);
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }

    /* JEST / RTL CONFIGURATION  **/

    try {
      await fs.promises.writeFile(
        path.join(root, 'jest.config.js'),
        JEST_CONFIG + os.EOL
      );

      console.log(MESSAGES.done);
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }

    /* INIT GIT  **/

    try {
      await execa(`git`, [`init`], {
        stdio: 'inherit',
        cwd: root,
      });
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }

    /* INSTALL HUSKY  **/

    try {
      const { execa } = await import('execa');

      if (useYarn) {
        await execa(`yarn`, [`dlx`, `husky-init`, `--yarn2`], {
          stdio: 'inherit',
          cwd: root,
        });
        await execa(`yarn`, [], {
          stdio: 'inherit',
        });
      } else {
        await execa(`npx`, [`husky-init`], {
          stdio: 'inherit',
          cwd: root,
        });
        await execa(`npm`, [`install`], {
          stdio: 'inherit',
        });
      }
    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }

    /* CONFIGURE PACKAGE  **/
    try {

      const packageFileJson = await fs.promises.readFile(
        path.join(root, 'package.json'),
        'utf8'
      );
      const packageFile = JSON.parse(packageFileJson);

      packageFile.scripts = {
        ...packageFile.scripts,
        test: 'jest --watch',
        'test:ci': 'jest --ci',
      };

      console.log({packageFile})

      await fs.promises.writeFile(
        path.join(root, 'package.json'),
        JSON.stringify(packageFile, null, 2) + os.EOL
      );

    } catch (error) {
      throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
    }
  });

program.parse();
