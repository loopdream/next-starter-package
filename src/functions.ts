import path from 'path';
import os from 'os';
import fs from 'fs';

import figlet from 'figlet';

import { MESSAGES, PRETTERRC, ESLINTRC } from './constants.js';

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

export async function InstallAndConfigurePrettier({
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
