import path from 'path';
import os from 'os';
import fs from 'fs';

export enum PackageManagerKindEnum {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
}

export enum PackageManagerAddEnum {
  ADD = 'add',
  INSTALL = 'install',
}

export enum PackageManagerSaveDevEnum {
  DEV = '--dev',
  SAVE_DEV = '--save-dev',
}

export type PackageManagerPropsType = {
  packageManagerKind: PackageManagerKindEnum;
  root: string;
  // stdio?: 'overlapped' | 'ignore' | 'inherit' | 'pipe';
};

export type AddToDependenciesType = {
  dependencies: string[];
  isDevDependencies?: boolean;
};

export type AddToScriptsType = Record<string, string>;

export type PackageManagerType = {
  addToDependencies: (o: AddToDependenciesType) => Promise<void>;
  addToScripts: (a: AddToScriptsType) => Promise<void>;
  getCmds: () => {
    add: PackageManagerAddEnum;
    saveDev: PackageManagerSaveDevEnum;
  };
  getKind: () => PackageManagerKindEnum;
};

class PackageManager {
  packageManagerKind: PackageManagerKindEnum;
  root: string;

  constructor({
    packageManagerKind,
    root, // stdio = undefined
  }: PackageManagerPropsType) {
    this.packageManagerKind = packageManagerKind;
    this.root = root;
  }

  public getKind = () => this.packageManagerKind && this.packageManagerKind;

  public getCmds = () => {
    return (
      this.packageManagerKind && {
        add:
          this.packageManagerKind === PackageManagerKindEnum.NPM
            ? PackageManagerAddEnum.INSTALL
            : PackageManagerAddEnum.ADD,
        saveDev:
          this.packageManagerKind === PackageManagerKindEnum.YARN
            ? PackageManagerSaveDevEnum.DEV
            : PackageManagerSaveDevEnum.SAVE_DEV,
      }
    );
  };

  public addToDependencies = async ({
    dependencies,
    isDevDependencies = false,
  }: AddToDependenciesType) => {
    const { execa } = await import('execa');
    try {
      const deps = [...dependencies];

      const cmds = this.getCmds();

      if (isDevDependencies) deps.push(cmds.saveDev);

      await execa(this.packageManagerKind, [cmds.add, ...deps], {
        // TODO - figure a way of outputting process AND controlling ora spinner
        // stdio: 'inherit',
        cwd: this.root,
      });
    } catch (error: unknown) {
      throw new Error(`${error}`);
    }
  };

  public addToScripts = async (scripts: AddToScriptsType) => {
    try {
      const packageFileJson = await fs.promises.readFile(
        path.join(this.root, 'package.json'),
        'utf8'
      );

      const packageFile = JSON.parse(packageFileJson);

      delete packageFile.scripts.lint; // delete next's lint setup script

      packageFile.scripts = {
        ...packageFile.scripts,
        ...scripts,
      };

      await fs.promises.writeFile(
        path.join(this.root, 'package.json'),
        JSON.stringify(packageFile, null, 2) + os.EOL
      );
    } catch (error: unknown) {
      throw new Error(`${error}`);
    }
  };
}

export default PackageManager;
