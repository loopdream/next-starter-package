import fs from 'fs';
import os from 'os';
import path from 'path';

const { execa } = await import('execa');

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

export type PackageManagerPropsType = {
  packageManagerKind: PackageManagerKindEnum;
  cwd: string;
};

export type AddToPackageType = Record<
  string,
  string | string[] | Record<string, string>
>;

class PackageManager {
  private packageManagerKind: PackageManagerKindEnum;
  private cwd: string;
  private packageFilePath: string;

  constructor({ packageManagerKind, cwd }: PackageManagerPropsType) {
    this.packageManagerKind = packageManagerKind;
    this.cwd = cwd;
    this.packageFilePath = path.join(this.cwd, 'package.json');
  }

  public getKind(): PackageManagerKindEnum {
    return this.packageManagerKind;
  }

  public async addToDependencies(
    dependencies: string[],
    addToDevDependencies: boolean = false
  ) {
    if (!Array.isArray(dependencies) || dependencies.length === 0) return;

    const pm = this.getKind();
    const add =
      pm === PackageManagerKindEnum.NPM
        ? PackageManagerAddEnum.INSTALL
        : PackageManagerAddEnum.ADD;

    const deps = [...dependencies];

    if (addToDevDependencies) deps.push('-D');

    await execa(pm, [add, ...deps], {
      cwd: this.cwd,
      stdio: 'inherit',
    }).catch((error) => {
      throw new Error(`${error}`);
    });
  }

  public async addToDevDependencies(dependencies: string[]) {
    return this.addToDependencies(dependencies, true);
  }

  public async addToPackage(
    property: string,
    values: AddToPackageType
  ): Promise<void> {
    const packageFile = await fs.promises
      .readFile(this.packageFilePath, 'utf8')
      .then((file) => JSON.parse(file))
      .catch((error) => {
        throw new Error(`${error}`);
      });

    packageFile[property] =
      property in packageFile
        ? { ...packageFile[property], ...values }
        : { ...values };

    await fs.promises
      .writeFile(
        this.packageFilePath,
        JSON.stringify(packageFile, null, 2) + os.EOL
      )
      .catch((error) => {
        throw new Error(`${error}`);
      });
  }
}

export default PackageManager;
