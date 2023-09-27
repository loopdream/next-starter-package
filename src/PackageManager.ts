import path from 'path';
import os from 'os';
import fs from 'fs';

export enum PackageManagerKindEnum {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
  BUN = 'bun',
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
  devDependencies?: boolean;
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
  private packageManagerKind: PackageManagerKindEnum;
  private root: string;

  constructor(props: PackageManagerPropsType) {
    this.packageManagerKind = props.packageManagerKind;
    this.root = props.root;
  }

  public getKind(): PackageManagerKindEnum {
    return this.packageManagerKind;
  }

  public getCmds(): {
    add: PackageManagerAddEnum;
    saveDev: PackageManagerSaveDevEnum;
  } {
    return {
      add:
        this.getKind() === PackageManagerKindEnum.NPM
          ? PackageManagerAddEnum.INSTALL
          : PackageManagerAddEnum.ADD,
      saveDev:
        this.getKind() === PackageManagerKindEnum.YARN
          ? PackageManagerSaveDevEnum.DEV
          : PackageManagerSaveDevEnum.SAVE_DEV,
    };
  }

  public async addToDependencies({
    dependencies,
    devDependencies = false,
  }: AddToDependenciesType): Promise<void> {
    try {
      const { execa } = await import('execa');
      const { add, saveDev } = this.getCmds();

      if (devDependencies) dependencies.push(saveDev);

      await execa(this.getKind(), [add, ...dependencies], {
        // stdio: 'inherit',
        cwd: this.root,
      });
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  public async addToScripts(scripts: AddToScriptsType): Promise<void> {
    try {
      const packageFilePath = path.join(this.root, 'package.json');
      const packageFileJson = await fs.promises.readFile(
        packageFilePath,
        'utf8'
      );
      const packageFile = JSON.parse(packageFileJson);

      packageFile.scripts = {
        ...packageFile.scripts,
        ...scripts,
      };

      await fs.promises.writeFile(
        packageFilePath,
        JSON.stringify(packageFile, null, 2) + os.EOL
      );
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
}

export default PackageManager;
