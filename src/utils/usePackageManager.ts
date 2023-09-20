import path from 'path';
import os from 'os';
import fs from 'fs';

export enum PackageManagerKind {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
}

export enum PackageManagerAddKind {
  ADD = 'add',
  INSTALL = 'install',
}

export enum PackageManagerSaveDevKind {
  DEV = '--dev',
  SAVE_DEV = '--save-dev',
}

export type UsePackageManagerType = {
  packageManager: PackageManagerKind;
  root: string;
};

export type AddToDependenciesType = {
  dependencies: string[];
  isDevDependencies?: boolean;
};

export type AddToScriptsType = Record<string, string>;

export type PackageManagerType = {
  name: PackageManagerKind;
  cmds: {
    add: PackageManagerAddKind;
    saveDev: PackageManagerSaveDevKind;
  };
  addToDependencies: (o: AddToDependenciesType) => Promise<void>;
  addToScripts: (a: AddToScriptsType) => Promise<void>;
};

const usePackageManager = ({
  packageManager: name,
  root,
}: UsePackageManagerType) => {
  const cmds = {
    add:
      name === PackageManagerKind.NPM
        ? PackageManagerAddKind.INSTALL
        : PackageManagerAddKind.ADD,
    saveDev:
      name === PackageManagerKind.NPM
        ? PackageManagerSaveDevKind.SAVE_DEV
        : PackageManagerSaveDevKind.DEV,
  };

  const addToDependencies = async ({
    dependencies,
    isDevDependencies = false,
  }: AddToDependenciesType) => {
    const { execa } = await import('execa');
    try {
      const deps = [...dependencies];
      if (isDevDependencies) deps.push(cmds.saveDev);

      await execa(name, [cmds.add, ...deps], {
        // stdio: 'inherit',
        cwd: root,
      });
    } catch (error: unknown) {
      throw new Error(`${error}`);
    }
  };

  const addToScripts = async (scripts: AddToScriptsType) => {
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

  return {
    name,
    cmds,
    addToDependencies,
    addToScripts,
  } as PackageManagerType;
};

export default usePackageManager;