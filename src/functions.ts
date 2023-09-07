import path from 'path';
import os from 'os';
import fs from 'fs';

import figlet from 'figlet';
import picocolors from 'picocolors';
const { blue } = picocolors;

import { MESSAGES } from './constants.js';

export const { log, error: errorLog } = console;

const oops = `\n${figlet.textSync('Ooops...')}\n\n`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

/**
 * nextJSInstall
 *
 * Runs the create-next-app installer
 * Set installer arguments: directory name, eslint, app-router
 *
 * @param    {String} projectDirectory   Directory to install next
 */

export async function nextJSInstall({
  root,
  config = [],
}: {
  root: string;
  config: string[];
}) {
  try {
    const { execa } = await import('execa');
    // call the next install with root, eslint, and app router as default
    await execa(`npx`, [`create-next-app@latest`, root, ...config], {
      stdio: 'inherit',
    });

    log(MESSAGES.done);
  } catch (error: unknown) {
    console.log(oops);
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
    const { execa } = await import('execa');
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
    const { execa } = await import('execa');
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
    const { execa } = await import('execa');
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

export function goodbye() {
  const goodbyes = [
    'Au Revoir',
    'Adios',
    'Good bye',
    'Ciao',
    'Arrivederci',
    'Zài jiàn',
    'Sayōnara',
    'Auf Wiedersehen',
    'Namaste',
    'Aloha',
  ];
  const randomGoodbye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
  return console.log(`\n`, figlet.textSync(randomGoodbye), '\n\n');
}
