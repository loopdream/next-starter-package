import path from 'path';
import os from 'os';
import fs from 'fs';

import { MESSAGES } from './constants.js';

import { execa } from 'execa';

export const { log, error: errorLog } = console;

/**
 * nextJSInstall
 *
 * Runs the create-next-app installer
 * Set installer arguments: directory name, eslint, app-router
 *
 * @param    {String} projectDirectory   Directory to install next
 */

export async function nextJSInstall(projectDirectory: string) {
  log(`${MESSAGES.nextJs} ./${projectDirectory}\n\n`);

  try {
    // call the next install with projectDirectory, eslint, and app router as default
    await execa(
      `npx`,
      [`create-next-app@latest`, projectDirectory, '--eslint', '--app'],
      {
        stdio: 'inherit',
      }
    );

    log(MESSAGES.done);
  } catch (error: unknown) {
    throw new Error(`${MESSAGES.nextJs.error} ${error}`);
  }

  return true;
}

/**
 * configureEslintPrettier
 *
 * Installs eslint and prettier packages
 * Configures the eslint and prettier rc files
 *
 * @param    {String} projectDirectory   the Directory to perform tasks in
 */

export async function configureEslintPrettier(projectDirectory: string) {
  try {
    log(MESSAGES.esLintPrettier.install);

    await execa(
      `npm`,
      [
        `install`,
        `-D`,
        `@typescript-eslint/eslint-plugin`,
        `prettier`,
        `eslint-config-prettier`,
      ],
      {
        stdio: 'inherit',
        cwd: projectDirectory,
      }
    );

    log(MESSAGES.done, MESSAGES.esLintPrettier.eslintrc);

    const eslintrc = {
      plugins: ['@typescript-eslint'],
      extends: [
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
      },
    };

    await fs.promises.writeFile(
      path.join(projectDirectory, '.eslintrc.json'),
      JSON.stringify(eslintrc, null, 2) + os.EOL
    );

    log(MESSAGES.done, MESSAGES.esLintPrettier.prettierrc);

    const prettierrc = {
      semi: false,
      trailingComma: 'es5',
      singleQuote: true,
      tabWidth: 2,
      useTabs: false,
    };

    await fs.promises.writeFile(
      path.join(projectDirectory, '.eslintrc.json'),
      JSON.stringify(prettierrc, null, 2) + os.EOL
    );

    log(MESSAGES.done);
  } catch (error) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
  return true;
}

export async function setupGit(projectDirectory: string) {
  try {
    await execa(`git`, [`init`], {
      stdio: 'inherit',
      cwd: projectDirectory,
    });
  } catch (error: unknown) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
}

export async function setupHusky(projectDirectory: string) {
  try {
    await execa(`npx`, [`husky-init`], {
      stdio: 'inherit',
      cwd: projectDirectory,
    });
    await execa(`npm`, [`install`], {
      stdio: 'inherit',
    });
  } catch (error: unknown) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
}
