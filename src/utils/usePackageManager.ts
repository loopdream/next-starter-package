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
  stdio?: 'overlapped' | 'ignore' | 'inherit' | 'pipe';
};

export type AddToDependenciesType = {
  dependencies: string[];
  isDevDependencies?: boolean;
};

export type AddToScriptsType = Record<string, string>;

export type PackageManagerType = {
  addToDependencies: (o: AddToDependenciesType) => Promise<void>;
  addToScripts: (a: AddToScriptsType) => Promise<void>;
  cmds: {
    add: PackageManagerAddKind;
    saveDev: PackageManagerSaveDevKind;
  };
  kind: PackageManagerKind;
};

const usePackageManager = ({
  packageManager: kind,
  root, // stdio = undefined,
}: UsePackageManagerType) => {
  const cmds = {
    add:
      kind === PackageManagerKind.NPM
        ? PackageManagerAddKind.INSTALL
        : PackageManagerAddKind.ADD,
    saveDev:
      kind === PackageManagerKind.YARN
        ? PackageManagerSaveDevKind.DEV
        : PackageManagerSaveDevKind.SAVE_DEV,
  };

  const addToDependencies = async ({
    dependencies,
    isDevDependencies = false,
  }: AddToDependenciesType) => {
    const { execa } = await import('execa');
    try {
      const deps = [...dependencies];
      if (isDevDependencies) deps.push(cmds.saveDev);

      await execa(kind, [cmds.add, ...deps], {
        // TODO - figure a way of outputting process AND controlling ora spinner
        // stdio: 'inherit',
        cwd: root,
      });
      // console.log({ stdio });
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
    addToDependencies,
    addToScripts,
    cmds,
    kind,
  } as PackageManagerType;
};

export default usePackageManager;
