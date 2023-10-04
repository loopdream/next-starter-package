import path from 'path';
import fs from 'fs';
import ora from 'ora';
import picocolors from 'picocolors';
import { $ } from 'execa';

import prompts from 'prompts';

import { oops } from './utils.js';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';
import { ChoiceValuesType } from './prompts.js';

type ConfiguratorPropsType = {
  packageManagerChoice: PackageManagerKindEnum;
  projectDirectoryPath: string;
};

export interface ConfigType {
  configDirectories: string[];
  configFiles: string[];
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
  optionalDependencies: ChoiceValuesType[];
  prettier: boolean;
  reactTestingLibrary: boolean;
  selectedDependencies: boolean;
  srcDir: boolean;
  storybook: boolean;
  tailwind: boolean;
  typescript: boolean;
  nextImageOptimisation: boolean;
}

const { cyan, green, bold } = picocolors;

class Configurator {
  private configsPath: string;
  private config = {} as ConfigType;
  private cwd: string;
  private markdownDirPath: string;
  private options = {
    appRouter: false,
    cypress: false,
    docker: false,
    dotEnvFiles: [],
    eslint: false,
    husky: false,
    jest: false,
    lintStaged: false,
    nextImageOptimisation: false,
    optionalDependencies: [],
    prettier: false,
    reactTestingLibrary: false,
    selectedDependencies: false,
    srcDir: false,
    storybook: false,
    tailwind: false,
    typescript: false,
  } as OptionsType;
  private packageManager = {} as PackageManager;
  private spinner;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: ConfiguratorPropsType) {
    this.configsPath = path.resolve(path.join('src', 'templates'));
    this.markdownDirPath = path.resolve(path.join('src', 'markdown'));
    this.cwd = path.resolve(projectDirectoryPath);
    this.spinner = ora();
    this.packageManager = new PackageManager({
      packageManagerKind,
      cwd: this.cwd,
    });
  }

  public run = async () => {
    console.log(
      `Using ${bold(this.packageManager.getKind())}` +
        `\n\n` +
        `The configurator will now setup your next project based on your selections.` +
        `\n\n`
    );

    await this.prepare()
      .then(() => this.installDependencies())
      .then(() => this.buildDependencyConfigs())
      .then(() => this.configurePackageFile())
      .then(() => this.generateReadme())
      .then(() => this.cleanUp());
  };

  public setOptions = (answers: prompts.Answers<string>) => {
    this.options = {
      ...this.options,
      ...answers,
    };
    return this.options;
  };

  public createNextApp = async () => {
    const pm = this.packageManager.getKind();

    await $({
      stdio: 'inherit',
    })`npx create-next-app@latest ${this.cwd} --use-${pm}`.catch((error) => {
      oops();
      throw new Error(`\n${error}`);
    });

    this.options = {
      ...this.options,
      ...this.getNextConfig(),
    };

    return this.options;
  };

  public getNextConfig = () => {
    const exists = (fileName: string) =>
      fs.existsSync(path.join(this.cwd, fileName)) || false;

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
      nextImageOptimisation,
      optionalDependencies,
      prettier,
      reactTestingLibrary,
      storybook,
      typescript,
    } = this.options;

    this.config.configFiles = [
      'next.config.js',
      ...(docker ? ['docker-compose.yml', 'Dockerfile', 'Makefile'] : []),
      ...(prettier ? ['.prettierrc.json', '.prettierignore'] : []),
      ...(jest ? ['jest.config.js'] : []),
    ];

    this.config.configDirectories = [
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

    this.config.packageDependencies = [
      ...(nextImageOptimisation ? ['sharp'] : []),
    ];

    this.config.packageDevDependencies = [
      ...(cypress ? ['cypress'] : []),
      ...(eslint && typescript ? ['@typescript-eslint/eslint-plugin'] : []),
      ...(lintStaged ? ['lint-staged'] : []),
      ...(prettier ? ['prettier', 'eslint-config-prettier'] : []),
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
      ...(jest ? ['jest', 'jest-environment-jsdom'] : []),
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

    const markdownFiles = [
      'next.md',
      ...(cypress ? ['cypress.md'] : []),
      ...(docker ? ['docker.md'] : []),
      ...(prettier ? ['prettier.md'] : []),
      ...(storybook ? ['storybook.md'] : []),
      ...(jest ? ['jest.md'] : []),
      ...(reactTestingLibrary ? ['reactTestingLibrary.md'] : []),
      ...(lintStaged ? ['lint-staged.md'] : []),
      ...(husky ? ['git.md', 'husky.md'] : []),
      ...(lintStaged ? ['selected-dependencies.md'] : []),
    ];

    const markdowns = await this.readFromFiles(markdownFiles);

    this.config.markdown = markdowns;

    return this.config;
  };

  public installConfigureGitHusky = async () => {
    const $execa = $({ cwd: this.cwd });
    const pm = this.packageManager.getKind();
    const { husky, eslint, lintStaged, prettier, typescript } = this.options;

    this.spinner.start('Configuring Git and Husky');

    await $execa`git init`.catch((error) => {
      oops();
      this.spinner.fail();
      throw new Error(`${error}`);
    });

    let huskyInit = $execa`npx husky-init && npm install`;

    // TODO: Manual install husky - the following fails unless npm
    if (pm === PackageManagerKindEnum.YARN) {
      huskyInit = $execa`yarn dlx husky-init --yarn2 && yarn`;
    }

    if (pm === PackageManagerKindEnum.PNPM) {
      huskyInit = $execa`pnpm dlx husky-init && pnpm install`;
    }

    if (pm === PackageManagerKindEnum.BUN) {
      huskyInit = $execa`bunx husky-init && bun install`;
    }

    await huskyInit;

    // rewrite husky pre-commit commands based on choices
    let huskyPreCommitFile = `#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"`;

    if (husky && lintStaged) {
      huskyPreCommitFile += `$\n\n{pm} run lint-staged`;
    } else {
      if (eslint) {
        huskyPreCommitFile += `\n\n${pm} run format:write`;
      }

      if (prettier) {
        huskyPreCommitFile +=
          `\n\${pm} run lint:check` + `\n\n${pm} run lint:fix`;
      }

      if (typescript) {
        huskyPreCommitFile += `\n\n${pm} run build --no-emit`;
      }
    }

    await fs.promises
      .writeFile(
        path.join(this.cwd, '.husky', 'pre-commit'),
        huskyPreCommitFile,
        'utf8'
      )
      .catch((error) => {
        oops();
        this.spinner.fail();
        throw new Error(`${error}`);
      });

    this.spinner.succeed();
  };

  public installDependencies = async () => {
    const { packageDependencies, packageDevDependencies } = this.config;

    const dependencies = this.config.packageDependencies
      .map((dep) => `- ` + cyan(dep))
      .sort()
      .join(`\n`);

    console.log(`\n\n` + `Installing Dependencies` + dependencies + `\n\n`);

    if (packageDependencies.length > 0) {
      await this.packageManager.addToDependencies(packageDependencies);
    }

    const devDependencies = this.config.packageDevDependencies
      .map((dep) => `- ` + cyan(dep))
      .sort()
      .join(`\n`);

    console.log(
      `\n\n` + `Installing devDependencies` + devDependencies + `\n\n`
    );

    if (packageDevDependencies.length > 0) {
      await this.packageManager.addToDevDependencies(packageDevDependencies);
    }

    if (this.options.husky) {
      //  await this.installConfigureGitHusky();
    }

    console.log(`\n\n`);
  };

  public configurePackageFile = async () => {
    const { eslint, jest, lintStaged, prettier, typescript } = this.options;
    const { packageScripts } = this.config;

    // package scripts
    await this.packageManager.addToPackage('scripts', packageScripts);

    // lint-staged
    if (lintStaged && (eslint || (eslint && typescript) || prettier || jest)) {
      let lintStaged: Record<string, string[]> = {
        '**/*.{js,jsx}': [
          ...(prettier ? ['format:write'] : []),
          ...(eslint ? ['lint:check', 'lint:fix'] : []),
          ...(jest ? ['test'] : []),
        ],
        '**/*.{md, yml, yaml, json}': ['format:write'],
        '**/*.css': ['format:write'],
      };

      if (eslint && typescript) {
        lintStaged = {
          ...lintStaged,
          '**/*.{ts,tsx}': [
            ...(prettier ? ['format:write'] : []),
            'lint:check',
            'lint:fix',
            ...(jest ? ['test'] : []),
            'build --noEmit',
          ],
        };
      }

      await this.packageManager.addToPackage('lint-staged', lintStaged);
    }
  };

  public configureEslint = async () => {
    const { storybook, prettier, eslint, typescript, reactTestingLibrary } =
      this.options;

    if (!eslint) return;

    const eslintrc = {
      cwd: true,
      plugins: [
        ...(eslint && typescript ? ['@typescript-eslint'] : []),
        ...(reactTestingLibrary ? ['testing-library'] : []),
      ],
      extends: [
        'next/core-web-vitals',
        ...(eslint && typescript
          ? ['plugin:@typescript-eslint/recommended']
          : []),
        ...(storybook ? ['plugin:storybook/recommended'] : []),
        ...(prettier ? ['prettier'] : []),
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
      },
      overrides: [
        ...(reactTestingLibrary
          ? [
              {
                files: [
                  '**/__tests__/**/*.[jt]s?(x)',
                  '**/?(*.)+(spec|test).[jt]s?(x)',
                ],
                extends: ['plugin:testing-library/react'],
              },
            ]
          : []),
      ],
    };

    await fs.promises
      .writeFile(
        path.join(this.cwd, '.eslintrc.json'),
        JSON.stringify(eslintrc)
      )
      .catch((error) => {
        oops();
        throw new Error(`${error}`);
      });
  };

  public buildDependencyConfigs = async () => {
    this.spinner.start('Building dependency configs');
    const { configDirectories, configFiles } = this.config;
    const { dotEnvFiles } = this.options;

    const configs = [];
    // Directories & Files
    if (configDirectories.length > 0) {
      configs.push(this.copyTemplate(configDirectories, true));
    }

    if (configFiles.length > 0) {
      configs.push(this.copyTemplate(configFiles));
    }

    if (configs.length >= 1) {
      await Promise.all(configs).catch((error) => {
        oops();
        this.spinner.fail();
        throw new Error(`${error}`);
      });
    }

    // .env files
    if (dotEnvFiles.length > 0) {
      const copyEnvFiles = dotEnvFiles.map(
        (file: string) => $`touch ${path.join(this.cwd, file)}`
      );
      await Promise.all(copyEnvFiles).catch((error) => {
        oops();
        this.spinner.fail();
        throw new Error(`${error}`);
      });
    }

    await this.configureEslint();
    this.spinner.succeed();
  };

  public cleanUp = async () => {
    // clean up ie format files - maybe other stuff TBC
    this.spinner.start('Cleaning up');

    if (this.options.prettier) {
      await $({
        cwd: this.cwd,
      })`${this.packageManager.getKind()} run format:write`.catch((error) => {
        this.spinner.fail();
        oops();
        console.log(`${error}`);
      });
    }

    this.spinner.succeed();

    return this.configurationCompleteMessage();
  };

  private configurationCompleteMessage = () => {
    return `${green(
      'Success!'
    )} The following configurations were made: TBC... `;
  };

  private readFromFiles = async (filenames: string[]) => {
    const filePaths = filenames.map((filename) =>
      path.join(this.markdownDirPath, filename)
    );

    const readFiles = filePaths.map((filePath) =>
      fs.readFileSync(filePath, 'utf8')
    );

    return await Promise.all(readFiles).catch((error) => {
      oops();
      throw new Error(`${error}`);
    });
  };

  public generateReadme = async () => {
    this.spinner.start('Generating Readme');
    const markdown = this.config.markdown.join('\n\n');
    await fs.promises
      .writeFile(path.join(this.cwd, 'README.md'), markdown)
      .then(() => this.spinner.succeed())
      .catch((error) => {
        this.spinner.fail();
        oops();
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
          path.join(this.configsPath, file),
          path.join(this.cwd, file),
          { recursive }
        )
      );

      return await Promise.all(copyFiles).catch((error) => {
        oops();
        throw new Error(`${error}`);
      });
    }
  };
}

export default Configurator;
