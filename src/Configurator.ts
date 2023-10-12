import { $ } from 'execa';
import figlet from 'figlet';
import fs from 'fs';
import { markdownTable } from 'markdown-table';
import ora, { Options as OraOptions } from 'ora';
//, { Options as OraOptions }
import path from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';
import makeEslintrc from './helpers/makeEslintrc.js';
import makeHuskyPreCommit from './helpers/makeHuskyPreCommit.js';
import makeLintStagedrc from './helpers/makeLintStagedrc.js';
import makePrettier from './helpers/makePrettier.js';
import { ChoiceValuesType } from './prompts.js';

type ConfiguratorPropsType = {
  packageManagerChoice: PackageManagerKindEnum;
  projectDirectoryPath: string;
};

export interface ConfigType {
  configTemplateDirectories: string[];
  configTemplateFiles: string[];
  markdown: string[];
  packageDependencies: string[];
  packageDevDependencies: string[];
  packageScripts: Record<string, string>;
}

export interface OptionsType {
  appRouter: boolean;
  cypress: boolean;
  docker: boolean;
  dotEnvFiles: string[];
  eslint: boolean;
  husky: boolean;
  jest: boolean;
  lintStaged: boolean;
  imageOptimisation: boolean;
  optionalDependencies: ChoiceValuesType[];
  packageManager: PackageManagerKindEnum;
  prettier: boolean;
  reactTestingLibrary: boolean;
  selectedDependencies: boolean;
  srcDir: boolean;
  storybook: boolean;
  tailwind: boolean;
  typescript: boolean;
}

const { red, cyan, green, bold } = picocolors;

class Configurator {
  private config = {} as ConfigType;
  private cwd: string;
  private options = {
    appRouter: false,
    cypress: false,
    docker: false,
    dotEnvFiles: [],
    eslint: false,
    husky: false,
    jest: false,
    lintStaged: false,
    imageOptimisation: false,
    optionalDependencies: [],
    packageManager: PackageManagerKindEnum.NPM,
    prettier: false,
    reactTestingLibrary: false,
    selectedDependencies: false,
    srcDir: false,
    storybook: false,
    tailwind: false,
    typescript: false,
  } as OptionsType;
  private packageManager = {} as PackageManager;
  private srcPath: string;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: ConfiguratorPropsType) {
    this.cwd = path.resolve(projectDirectoryPath);
    this.srcPath = path.resolve(path.join('src'));
    this.options.packageManager = packageManagerKind;
    this.packageManager = new PackageManager({
      packageManagerKind,
      cwd: this.cwd,
    });
  }

  private withSpinner = async (
    fn: () => Promise<void>,
    text: string,
    opts?: OraOptions
  ) => {
    const spinner = ora(opts).start(text);
    await fn()
      .then(() => spinner.succeed())
      .catch(() => spinner.fail());
  };

  public run = async (options: prompts.Answers<string>) => {
    const { withSpinner } = this;
    this.setOptions(options)
      .then(() => this.prepare())
      .then(() => {
        console.log(
          `\n\n`,
          bold(`Using ` + this.packageManager.getKind()),
          `\n\n`,
          `The configurator will now setup your next project based on your selections.`,
          `\n\n`
        );
      })
      .then(() => this.installDependencies())
      .then(() => withSpinner(this.buildConfigs, 'Building configs'))
      .then(() => withSpinner(this.configurePackageFile, 'Configuring package'))
      .then(() => withSpinner(this.generateReadme, 'Generating Readme'))
      .then(() => withSpinner(this.cleanUp, 'Cleaning up'))
      .then(() =>
        console.log(
          `\n`,
          green('Success! '),
          `The following configurations were made: <TODO: ADD MORE INFO>`
        )
      )
      .catch((error) => {
        console.log(`\n`, figlet.textSync('Ooops...'), `\n\n`);
        throw new Error(`${error}`);
      });
  };

  public setOptions = (answers: OptionsType | prompts.Answers<string>) =>
    new Promise((resolve) => {
      this.options = {
        ...this.options,
        ...answers,
      };
      resolve(this.options);
    });

  public createNextApp = async () => {
    const { cwd, packageManager } = this;
    const pm = packageManager.getKind();

    await $({
      stdio: 'inherit',
    })`npx create-next-app@latest ${cwd} --use-${pm}`.catch((error) => {
      console.log(
        `\n\n`,
        red(bold('Error!')),
        `Please check that your chosen package manager ${cyan(
          bold(pm)
        )} is installed:`,
        cyan(
          pm === PackageManagerKindEnum.PNPM
            ? 'https://pnpm.io/installation'
            : pm === PackageManagerKindEnum.YARN
            ? 'https://yarnpkg.com/getting-started/install'
            : 'https://bun.sh/docs/installation'
        ),
        `\n\n`
      );
      throw new Error(`\n${error}`);
    });

    this.options = {
      ...this.options,
      ...this.getNextConfig(),
    };

    return this.options;
  };

  public getConfig = () => this.config;

  public getNextConfig = () => {
    const exists = (fileName: string) =>
      fs.existsSync(path.join(this.cwd, fileName));

    const typescript = exists('tsconfig.json');

    return {
      appRouter: !exists('src/pages'),
      eslint: exists('.eslintrc.json'),
      tailwind: exists(`tailwind.config.${typescript ? 'ts' : 'js'}`),
      srcDir: exists('src'),
      typescript,
    };
  };

  public prepare = async () => {
    const pm = this.packageManager.getKind();
    const {
      cypress,
      docker,
      eslint,
      husky,
      jest,
      lintStaged,
      imageOptimisation,
      optionalDependencies,
      prettier,
      reactTestingLibrary,
      storybook,
      typescript,
    } = this.options;

    this.config.configTemplateFiles = [
      'next.config.js',
      ...(docker ? ['docker-compose.yml', 'Dockerfile', 'Makefile'] : []),
      ...(jest ? ['jest.config.js', 'jest.setup.js'] : []),
    ];

    this.config.configTemplateDirectories = [
      ...(cypress ? ['cypress'] : []),
      ...(storybook ? ['.storybook'] : []),
    ];

    this.config.packageScripts = {
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
      'build-start': `next build && next start`,
      'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
      ...(prettier
        ? {
            'format:check': 'prettier --check .',
            'format:write': 'prettier --write .',
          }
        : {}),
      ...(jest
        ? {
            test: 'jest',
            'test:watch': 'jest --watch',
            'test:coverage': 'jest --coverage',
            'test:ci': 'jest --ci --coverage',
          }
        : {}),
      ...(cypress ? { e2e: 'cypress run' } : {}),
      ...(storybook
        ? {
            storybook: 'storybook dev -p 6006',
            'build-storybook': 'storybook build',
          }
        : {}),
    };

    this.config.packageDependencies = [...(imageOptimisation ? ['sharp'] : [])];

    this.config.packageDevDependencies = [
      ...(cypress ? ['cypress'] : []),
      ...(eslint && typescript ? ['@typescript-eslint/eslint-plugin'] : []),
      ...(lintStaged ? ['lint-staged'] : []),
      ...(prettier
        ? [
            'prettier',
            'eslint-config-prettier',
            '@trivago/prettier-plugin-sort-imports',
          ]
        : []),
      ...(storybook
        ? [
            '@storybook/addon-essentials',
            '@storybook/addon-interactions',
            '@storybook/addon-links',
            '@storybook/addon-onboarding',
            '@storybook/blocks',
            '@storybook/nextjs',
            '@storybook/react',
            '@storybook/testing-library',
            'eslint-plugin-storybook',
            'storybook',
          ]
        : []),
      ...(jest
        ? [
            'jest',
            'jest-environment-jsdom',
            ...(typescript ? ['@types/jest', 'ts-jest'] : []),
          ]
        : []),
      ...(reactTestingLibrary
        ? [
            '@testing-library/jest-dom',
            '@testing-library/user-event',
            '@testing-library/react',
            'eslint-plugin-testing-library',
          ]
        : []),
    ];

    if (optionalDependencies?.length > 0) {
      this.config.packageDependencies.push(
        ...optionalDependencies
          .filter(({ saveDev }) => !saveDev)
          .map(({ module }) => module)
      );

      this.config.packageDevDependencies.push(
        ...optionalDependencies
          .filter(({ saveDev }) => saveDev)
          .map(({ module }) => module)
      );
    }

    this.config.markdown = [
      'next.md',
      ...(cypress ? ['cypress.md'] : []),
      ...(docker ? ['docker.md'] : []),
      ...(prettier ? ['prettier.md'] : []),
      ...(storybook ? ['storybook.md'] : []),
      ...(jest ? ['jest.md'] : []),
      ...(reactTestingLibrary ? ['reactTestingLibrary.md'] : []),
      ...(lintStaged ? ['lint-staged.md'] : []),
      ...(husky ? ['git.md', 'husky.md'] : []),
      ...(optionalDependencies.length > 0 ? ['selected-dependencies.md'] : []),
    ];

    return this.config;
  };

  public installConfigureGitHusky = async () => {
    const $execa = $({ cwd: this.cwd });

    await $execa`git init`.catch((error) => {
      throw new Error(`${error}`);
    });

    // TODO: Manual install husky - the following fails unless npm
    //const huskyInit = $execa`npx husky-init && npm install`;
    // if (pm === PackageManagerKindEnum.YARN) {
    //   huskyInit = $execa`yarn dlx husky-init --yarn2 && yarn`;
    // }

    // if (pm === PackageManagerKindEnum.PNPM) {
    //   huskyInit = $execa`pnpm dlx husky-init && pnpm install`;
    // }

    // if (pm === PackageManagerKindEnum.BUN) {
    //   huskyInit = $execa`bunx husky-init && bun install`;
    // }

    await $execa`npx husky-init && npm install`.catch((error) => {
      throw new Error(`${error}`);
    });

    const huskyPreCommit = makeHuskyPreCommit(this.options);

    await fs.promises
      .writeFile(
        path.join(this.cwd, '.husky', 'pre-commit'),
        huskyPreCommit,
        'utf8'
      )
      .catch((error) => {
        throw new Error(`${error}`);
      });
  };

  public installDependencies = async () => {
    const { packageDependencies, packageDevDependencies } = this.config;

    const dependencies = this.config.packageDependencies
      .map((dep) => `- ` + cyan(dep))
      .sort()
      .join(`\n`);

    console.log(
      `\n\n`,
      `Installing Dependencies`,
      `\n\n`,
      dependencies,
      `\n\n`
    );

    if (packageDependencies.length > 0) {
      console.log(this.options);
      await this.packageManager.addToDependencies(packageDependencies);
    }

    const devDependencies = this.config.packageDevDependencies
      .map((dep) => `- ` + cyan(dep))
      .sort()
      .join(`\n`);

    console.log(
      `\n\n`,
      `Installing devDependencies`,
      `\n\n`,
      devDependencies,
      `\n\n`
    );

    if (packageDevDependencies.length > 0) {
      await this.packageManager.addToDevDependencies(packageDevDependencies);
    }

    console.log(`\n\n`);

    if (this.options.husky) {
      await this.installConfigureGitHusky();
    }
  };

  public configurePackageFile = async () => {
    await this.packageManager.addToPackage(
      'scripts',
      this.config.packageScripts
    );

    if (this.options.lintStaged) {
      const lintstagedrc = makeLintStagedrc(this.options);
      await this.packageManager.addToPackage('lint-staged', lintstagedrc);
    }
  };

  private configurePrettier = async () => {
    if (!this.options.prettier) return;

    const prettierrc = makePrettier.makePrettierrc();
    const prettierignore = makePrettier.makePrettierignore();

    const prettierFiles = [
      fs.promises.writeFile(
        path.join(this.cwd, '.prettierrc.json'),
        JSON.stringify(prettierrc, null, 2),
        { encoding: 'utf8' }
      ),
      fs.promises.writeFile(
        path.join(this.cwd, '.prettierignore'),
        prettierignore,
        { encoding: 'utf8' }
      ),
    ];

    await Promise.all(prettierFiles).catch((error) => {
      throw new Error(`${error}`);
    });
  };

  private configureEslint = async () => {
    if (!this.options.eslint) return;

    const eslintrc = makeEslintrc(this.options);

    await fs.promises
      .writeFile(
        path.join(this.cwd, '.eslintrc.json'),
        JSON.stringify(eslintrc)
      )
      .catch((error) => {
        throw new Error(`${error}`);
      });
  };

  public buildConfigs = async () => {
    const { configTemplateDirectories, configTemplateFiles } = this.config;
    const { dotEnvFiles } = this.options;

    const configs: Promise<void[] | undefined>[] = [];

    if (configTemplateDirectories.length > 0) {
      configs.push(this.copyTemplate(configTemplateDirectories, true));
    }

    if (configTemplateFiles.length > 0) {
      configs.push(this.copyTemplate(configTemplateFiles));
    }

    if (configs.length >= 1) {
      await Promise.all(configs).catch((error) => {
        throw new Error(`${error}`);
      });
    }

    // .env files
    if (dotEnvFiles.length > 0) {
      const copyEnvFiles = dotEnvFiles.map(
        (file: string) => $`touch ${path.join(this.cwd, file)}`
      );
      await Promise.all(copyEnvFiles).catch((error) => {
        throw new Error(`${error}`);
      });
    }

    await this.configurePrettier();
    await this.configureEslint();
  };

  public cleanUp = async () => {
    // clean up ie format files - maybe other stuff TBC

    if (this.options.prettier) {
      await $({
        cwd: this.cwd,
      })`${this.packageManager.getKind()} run format:write`.catch((error) => {
        console.log(`${error}`);
      });
    }
  };

  private readFromFiles = async (filenames: string[]) => {
    const filePaths = filenames.map((filename) =>
      path.join(this.srcPath, 'markdown', filename)
    );

    const readFiles = filePaths.map((filePath) =>
      fs.readFileSync(filePath, 'utf8')
    );

    const markdownArr = await Promise.all(readFiles).catch((error) => {
      throw new Error(`${error}`);
    });

    return markdownArr;
  };

  private makeDependenciesMarkdownTable() {
    const tableHeader = ['Package name', 'Package description', 'Type'];
    const tableData = this.options.optionalDependencies.map(
      ({ module, github, description, saveDev }) => [
        `[${module}](${github})`,
        description,
        saveDev ? '`devDependency`' : '`dependency`',
      ]
    );

    return markdownTable([tableHeader, ...tableData]);
  }

  public generateReadme = async () => {
    await this.readFromFiles(this.config.markdown)
      .then((markdownStrArr) => {
        if (this.options.optionalDependencies.length > 0) {
          markdownStrArr.push(this.makeDependenciesMarkdownTable());
        }
        return markdownStrArr.join('\n\n');
      })
      .then((markdown) =>
        fs.promises.writeFile(path.join(this.cwd, 'README.md'), markdown)
      )
      .catch((error) => {
        throw new Error(`${error}`);
      });
  };

  private copyTemplate = async (
    template: string[],
    recursive: boolean = false
  ) => {
    if (Array.isArray(template) && template.length > 0) {
      const copyFiles = template.map((file) =>
        fs.promises.cp(
          path.join(this.srcPath, 'templates', file),
          path.join(this.cwd, file),
          { recursive }
        )
      );

      return await Promise.all(copyFiles).catch((error) => {
        throw new Error(`${error}`);
      });
    }
  };
}

export default Configurator;
