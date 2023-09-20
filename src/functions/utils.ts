#!/usr/bin/env ts-node
import path from 'path';
import os from 'os';
import fs from 'fs';
import figlet from 'figlet';

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

export const addToPackageScripts = async ({
  scripts,
  root,
}: {
  scripts: Record<string, string>;
  root: string;
}) => {
  try {
    const packageFileJson = await fs.promises.readFile(
      path.join(root, 'package.json'),
      'utf8'
    );

    const packageFile = JSON.parse(packageFileJson);

    delete packageFile.scripts.lint; // delete next's lint setup script

    packageFile.scripts = {
      ...packageFile.scripts,
      ...scripts,
    };

    await fs.promises.writeFile(
      path.join(root, 'package.json'),
      JSON.stringify(packageFile, null, 2) + os.EOL
    );
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
};

export const addToDevDependencies = async ({
  dependencies,
  packageManager,
  packageManagerAdd,
  root,
}: {
  dependencies: string[];
  packageManager: string;
  packageManagerAdd: string;
  root: string;
}) => {
  const { execa } = await import('execa');
  try {
    await execa(packageManager, [packageManagerAdd, ...dependencies], {
      // stdio: 'inherit',
      cwd: root,
    });
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
};

export const oops = `\n${figlet.textSync('Ooops...')}\n\n`;
