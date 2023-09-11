import path from 'path';
import os from 'os';
import fs from 'fs';

import figlet from 'figlet';

import { MESSAGES, PRETTERRC, ESLINTRC } from './constants.js';

export const { log, error: errorLog } = console;

export const oops = `\n${figlet.textSync('Ooops...')}\n\n`;

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
 * @param    {String} root   Directory to install next
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
    console.log(`\n`); // line break
    // call the next install with root, eslint, and app router as default
    await execa(`npx`, [`create-next-app@latest`, root, ...config], {
      stdio: 'inherit',
    });

    log(MESSAGES.done);
  } catch (error: unknown) {
    console.log(oops);
    throw new Error(`\n${MESSAGES.nextJs.error} ${error}`);
  }

  return true;
}

export async function configureEslint({
  root,
  useYarn = false,
}: {
  root: string;
  useYarn: boolean;
}) {
  try {
    const { execa } = await import('execa');
    log(MESSAGES.esLintPrettier.install);

    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';

    await execa(pkgMgr, [pkgMgrCmd, `-D`, `@typescript-eslint/eslint-plugin`], {
      stdio: 'inherit',
      cwd: root,
    });

    log(MESSAGES.done, MESSAGES.esLintPrettier.eslintrc);

    await fs.promises.writeFile(
      path.join(root, '.eslintrc.json'),
      JSON.stringify(ESLINTRC, null, 2) + os.EOL
    );

    log(MESSAGES.done);
  } catch (error) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
  return true;
}

export async function installAndConfigurePrettier({
  root,
  useYarn = false,
}: {
  root: string;
  useYarn: boolean;
}) {
  try {
    const { execa } = await import('execa');
    log(MESSAGES.esLintPrettier.install);

    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';

    await execa(
      pkgMgr,
      [pkgMgrCmd, `-D`, `prettier`, `eslint-config-prettier`],
      {
        stdio: 'inherit',
        cwd: root,
      }
    );

    // ...and add prettier to eslint extends prop
    const eslintrc = { ...ESLINTRC };
    eslintrc.extends.push('prettier');
    // write updated eslintrc
    await fs.promises.writeFile(
      path.join(root, '.eslintrc.json'),
      JSON.stringify(eslintrc, null, 2) + os.EOL
    );

    log(MESSAGES.done, MESSAGES.esLintPrettier.prettierrc);

    await fs.promises.writeFile(
      path.join(root, '.prettierrc.json'),
      JSON.stringify(PRETTERRC, null, 2) + os.EOL
    );

    log(MESSAGES.done);
  } catch (error) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
  return true;
}

export async function setupGit(root: string) {
  try {
    const { execa } = await import('execa');
    await execa(`git`, [`init`], {
      stdio: 'inherit',
      cwd: root,
    });
  } catch (error: unknown) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
}

export async function setupHusky({
  root,
  useYarn = false,
}: {
  root: string;
  useYarn: boolean;
}) {
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
  } catch (error: unknown) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
}

export function goodbye() {
  const goodbyes = [
    'Adios',
    'Aloha',
    'Arrivederci',
    'Au Revoir',
    'Auf Wiedersehen',
    'Ciao',
    'Good bye',
    'Namaste',
    'Sayōnara',
    'Zài jiàn',
  ];
  const randomGoodbye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
  return console.log(`\n`, figlet.textSync(randomGoodbye), '\n\n');
}

export async function installAndConfigureJestRTL({
  root,
  useYarn = false,
}: {
  root: string;
  useYarn: boolean;
}) {
  try {
    const { execa } = await import('execa');
    log('Installing React Testing library');

    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';

    await execa(
      pkgMgr,
      [
        pkgMgrCmd,
        `-D`,
        `@testing-library/jest-dom`,
        `@testing-library/user-event`,
        `@types/testing-library__jest-dom`,
        `eslint-plugin-testing-library`,
        `jest @testing-library/react`,
        `jest-environment-jsdom`,
      ],
      {
        stdio: 'inherit',
        cwd: root,
      }
    );

    log('Installed React Testing library');

    log(MESSAGES.done);
  } catch (error) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
  return true;
}

export async function installAndConfigureCypress({
  root,
  useYarn = false,
}: {
  root: string;
  useYarn: boolean;
}) {
  try {
    const { execa } = await import('execa');
    log('Installing Cypress');

    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';

    await execa(pkgMgr, [pkgMgrCmd, `-D`, `cypress`], {
      stdio: 'inherit',
      cwd: root,
    });

    log('Installed Cypress');

    log(MESSAGES.done);
  } catch (error) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
  return true;
}

export async function installDependancies({
  root,
  useYarn = false,
}: {
  root: string;
  useYarn: boolean;
}) {
  try {
    const { execa } = await import('execa');
    log('Installing Dependancies');
    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';

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

    log('Installed Dependancies');

    log(MESSAGES.done);
  } catch (error) {
    throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
  }
  return true;
}
