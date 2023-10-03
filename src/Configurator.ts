import path from 'path';
import fs from 'fs';
import ora from 'ora';
import picocolors from 'picocolors';
import { $ } from 'execa';

import prompts from 'prompts';

import { oops } from './utils.js';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';
import { configureLintStaged } from './questions.js';

type NextraPropsType = {
  projectDirectoryPath: string;
  packageManagerChoice: PackageManagerKindEnum;
};

export interface NextJsConfigType {
  appRouter: boolean;
  eslint: boolean;
  srcDir: boolean;
  tailwind: boolean;
  typescript: boolean;
}

export interface ConfigurationObjectsType {
  markdown: string[];
  configFiles: string[];
  configDirectories: string[];
  packageScripts: Record<string, string>;
  packageDependencies: string[];
  packageDevDependencies: string[];
}

const { green } = picocolors;

class Configurator {
  private root: string;
  private configsPath: string;
  private markdownDirPath: string;
  private nextConfig = {} as NextJsConfigType;
  private packageManager = {} as PackageManager;
  private promptAnswers = {} as prompts.Answers<string>;
  private spinner;
  private use = {
    cypress: false,
    docker: false,
    eslint: false,
    husky: false,
    jest: false,
    lintStaged: false,
    prettier: false,
    reactTestingLibrary: false,
    storybook: false,
    tsEslint: false,
    typescript: false,
    selectedDependencies: false,
  };
  private configurationObjects = {
    configDirectories: [],
    configFiles: [],
    markdown: [],
    packageDependencies: [],
    packageDevDependencies: [],
    packageScripts: {},
  } as ConfigurationObjectsType;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: NextraPropsType) {
    this.configsPath = path.resolve(path.join('src', 'templates'));
    this.markdownDirPath = path.resolve(path.join('src', 'markdown'));
    this.root = path.resolve(projectDirectoryPath);
    this.spinner = ora();
    this.packageManager = new PackageManager({
      packageManagerKind,
      root: this.root,
    });
  }

  public run = async () => {
    await this.prepare()
      .then(() => this.configurePackageFile())
      .then(() => this.installDependencies())
      .then(() => this.buildConfigs())
      .then(() => this.generateReadme())
      .then(() => this.cleanUp());
  };

  public setPromptAnswers = (answers: prompts.Answers<string>) => {
    this.promptAnswers = answers;
  };

  public createNextApp = async () => {
    const pm = this.packageManager.getKind();
    console.log(`\n`);

    await $({
      stdio: 'inherit',
    })`npx create-next-app@latest ${this.root} --use-${pm}`.catch((error) => {
      oops();
      throw new Error(`\n${error}`);
    });

    return this.getNextConfig();
  };

  public getNextConfig = () => {
    if (Object.keys(this.nextConfig).length > 1) {
      return this.nextConfig;
    }

    const exists = (fileName: string) =>
      fs.existsSync(path.join(this.root, fileName));

    const typescript = exists('tsconfig.json') || false;
    this.nextConfig = {
      appRouter: !exists('src/pages') || false,
      eslint: exists('.eslintrc.json') || false,
      tailwind: exists(`tailwind.config.${typescript ? 'ts' : 'js'}`) || false,
      srcDir: exists('src') || false,
      typescript,
    };

    return this.nextConfig;
  };

  public prepare = async () => {
    const pm = this.packageManager.getKind();
    const {
      configureCypress,
      configureDocker,
      configureHusky,
      configureJestRTL,
      configurePrettier,
      configureSelectedDependencies,
      configureStorybook,
    } = this.promptAnswers;

    const configFiles = [
      'next.config.js',
      ...(configureDocker
        ? ['docker-compose.yml', 'Dockerfile', 'Makefile']
        : []),
      ...(configurePrettier ? ['.prettierrc.json', '.prettierignore'] : []),
      ...(configureJestRTL ? ['jest.config.js'] : []),
    ];

    this.configurationObjects.configFiles.push(...configFiles);

    const configDirectories = [
      ...(configureCypress ? ['cypress'] : []),
      ...(configureStorybook ? ['.storybook'] : []),
    ];

    this.configurationObjects.configDirectories.push(...configDirectories);

    this.configurationObjects.packageScripts = {
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
      'build-start': `next build && next start`,
      'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
      ...(configurePrettier
        ? {
            'format:check': 'prettier --check .',
            'format:write': 'prettier --write .',
          }
        : {}),
      ...(configureJestRTL
        ? {
            test: 'jest',
            'test:watch': 'jest --watch',
            'test:coverage': 'jest --coverage',
            'test:ci': 'jest --ci --coverage',
          }
        : {}),
      ...(configureCypress ? { e2e: 'cypress run' } : {}),
      ...(configureStorybook
        ? {
            storybook: 'storybook dev -p 6006',
            'build-storybook': 'storybook build',
          }
        : {}),
    };

    const dependencies = [
      ...(this.promptAnswers.configureNextImageOptimisation ? ['sharp'] : []),
    ];

    this.configurationObjects.packageDependencies.push(...dependencies);

    const devDependencies = [
      ...(configureCypress ? ['cypress'] : []),
      ...(!this.nextConfig.eslint ? ['eslint'] : []),
      ...(configurePrettier ? ['prettier', 'eslint-config-prettier'] : []),
      ...(configureStorybook
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
      ...(configureJestRTL
        ? [
            'jest',
            'jest-environment-jsdom',
            '@testing-library/jest-dom',
            '@testing-library/user-event',
            '@testing-library/react',
            'eslint-plugin-testing-library',
          ]
        : []),
    ];

    this.configurationObjects.packageDevDependencies.push(...devDependencies);

    if (configureSelectedDependencies?.length > 0) {
      this.configurationObjects.packageDependencies.push(
        ...configureSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
          .map(({ module }: { module: string }) => module)
      );

      this.configurationObjects.packageDevDependencies.push(
        ...configureSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
          .map(({ module }: { module: string }) => module)
      );
    }

    const markdownFiles = [
      'next.md',
      ...(configureCypress ? ['cypress.md'] : []),
      ...(configureDocker ? ['docker.md'] : []),
      ...(configurePrettier ? ['prettier.md'] : []),
      ...(configureStorybook ? ['storybook.md'] : []),
      ...(configureJestRTL ? ['jestRTL.md'] : []),
      ...(configureLintStaged ? ['lint-staged.md'] : []),
      ...(configureHusky ? ['git.md', 'husky.md'] : []),
      ...(configureLintStaged ? ['selected-dependencies.md'] : []),
    ];

    const markdowns = await this.getFromFiles(markdownFiles);

    this.configurationObjects.markdown = markdowns;

    this.setUse();

    return this.configurationObjects;
  };

  private setUse = () => {
    const {
      configureCypress: cypress,
      configureDocker: docker,
      configureHusky: husky,
      configureJestRTL: reactTestingLibrary,
      configurePrettier: prettier,
      configureSelectedDependencies: selectedDependencies,
      configureStorybook: storybook,
      configureLintStaged: lintStaged,
    } = this.promptAnswers;

    const { typescript, eslint } = this.nextConfig;
    const { packageDevDependencies } = this.configurationObjects;

    this.use = {
      cypress,
      eslint,
      docker,
      husky,
      jest: reactTestingLibrary, // TODO make Jest a seperate prompt choice
      lintStaged,
      prettier: prettier && packageDevDependencies.includes('prettier'),
      reactTestingLibrary,
      storybook,
      tsEslint:
        eslint &&
        packageDevDependencies.includes('eslint-plugin-testing-library'),
      typescript,
      selectedDependencies,
    };
  };

  public installConfigureGitHusky = async () => {
    const $execa = $({ cwd: this.root });
    const pm = this.packageManager.getKind();

    this.spinner.start('Configuring Git and Husky');

    await $execa`git init`.catch((error) => {
      oops();
      this.spinner.fail();
      throw new Error(`${error}`);
    });

    const huskyInit =
      pm === PackageManagerKindEnum.YARN
        ? `yarn dlx husky-init --yarn2 && yarn`
        : pm === PackageManagerKindEnum.PNPM
        ? `pnpm dlx husky-init && pnpm install`
        : pm === PackageManagerKindEnum.BUN
        ? 'bunx husky-init && bun install'
        : 'npx husky-init && npm install';

    await $execa`${huskyInit}`.catch((error) => {
      oops();
      this.spinner.fail();
      throw new Error(`${error}`);
    });

    // rewrite husky pre-commit commands based on choices
    const huskyPreCommitStr =
      `#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"` +
      (this.nextConfig.eslint
        ? `\n\nnpm run lint:check\n\nnpm run lint:fix`
        : '') +
      (this.promptAnswers.configurePrettier ? `\n\nnpm run format:write` : '');

    await fs.promises
      .writeFile(
        path.join(this.root, '.husky', 'pre-commit'),
        huskyPreCommitStr,
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
    this.spinner.start('Installing Dependencies');

    const { packageDependencies, packageDevDependencies } =
      this.configurationObjects;

    if (packageDependencies.length > 0) {
      await this.packageManager.addToDevDependencies(packageDependencies);
    }

    if (packageDevDependencies.length > 0) {
      await this.packageManager.addToDevDependencies(packageDevDependencies);
    }

    if (this.promptAnswers.configureGitHusky) {
      await this.installConfigureGitHusky();
    }

    this.spinner.succeed();
  };

  public configurePackageFile = async () => {
    const { configureLintStaged, configurePrettier } = this.promptAnswers;
    const { packageScripts, packageDevDependencies } =
      this.configurationObjects;

    const hasPrettier =
      configurePrettier && packageDevDependencies.includes('prettier');

    const hasEslint =
      this.nextConfig.eslint || packageDevDependencies.includes('eslint');

    const hasTsEslint = packageDevDependencies.includes(
      '@typescript-eslint/eslint-plugin'
    );

    const hasJest = packageDevDependencies.includes('jest');

    // package scripts
    await this.packageManager.addToPackage('scripts', packageScripts);

    // lint-staged
    if (
      configureLintStaged &&
      (hasEslint || hasTsEslint || hasPrettier || hasJest)
    ) {
      let lintStaged: Record<string, string[]> = {
        '**/*.{js,jsx}': [
          ...(hasPrettier ? ['format:write'] : []),
          ...(hasEslint ? ['lint:check', 'lint:fix'] : []),
          ...(hasJest ? ['test'] : []),
        ],
        '**/*.{md, yml, yaml}': ['format:write'],
        '**/*.css': ['format:write'],
      };

      if (hasTsEslint) {
        lintStaged = {
          ...lintStaged,
          '**/*.{ts,tsx}': [
            ...(hasPrettier ? ['format:write'] : []),
            ...(hasTsEslint ? ['lint:check', 'lint:fix'] : []),
            ...(hasJest ? ['test'] : []),
            'build --noEmit',
          ],
        };
      }

      await this.packageManager.addToPackage('lint-staged', lintStaged);
    }
  };

  public configureEslint = async () => {
    const { configurePrettier, configureStorybook } = this.promptAnswers;
    const { packageDevDependencies } = this.configurationObjects;

    const hasPrettier =
      configurePrettier &&
      packageDevDependencies.includes('prettier') &&
      packageDevDependencies.includes('eslint-config-prettier');

    const hasTsEslint = packageDevDependencies.includes(
      '@typescript-eslint/eslint-plugin'
    );

    const hasRTL = packageDevDependencies.includes('@testing-library/react');

    const hasStorybook =
      configureStorybook &&
      packageDevDependencies.includes('eslint-plugin-storybook');

    if (!this.nextConfig.eslint || !configurePrettier) return;

    const eslint = {
      root: true,
      plugins: [
        ...(hasTsEslint ? ['@typescript-eslint'] : []),
        ...(hasRTL ? ['testing-library'] : []),
      ],
      extends: [
        'next/core-web-vitals',
        ...(hasTsEslint ? ['plugin:@typescript-eslint/recommended'] : []),
        ...(hasStorybook ? ['plugin:storybook/recommended'] : []),
        ...(hasPrettier ? ['prettier'] : []),
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
      },
      overrides: [
        ...(hasRTL
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
      .writeFile(path.join(this.root, '.eslintrc.json'), JSON.stringify(eslint))
      .catch((error) => {
        oops();
        throw new Error(`${error}`);
      });
  };

  public buildConfigs = async () => {
    this.spinner.start('Building configs');
    const { configDirectories, configFiles } = this.configurationObjects;
    const { configureDotEnvFiles } = this.promptAnswers;

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
    if (configureDotEnvFiles.length > 0) {
      const copyEnvFiles = configureDotEnvFiles.map(
        (file: string) => $`touch ${path.join(this.root, file)}`
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
    // clean up ie format files + write Readme - maybe other stuff TBC
    this.spinner.start('Cleaning up');

    if (this.promptAnswers.configurePrettier) {
      await $({
        cwd: this.root,
      })`${this.packageManager.getKind()} run format:write`
        .then(() => this.spinner.succeed())
        .catch((error) => {
          this.spinner.fail();
          oops();
          console.log(`${error}`);
        });
    }

    if (this.spinner.isSpinning) this.spinner.succeed();

    return this.configurationCompleteMessage();
  };

  private configurationCompleteMessage = () => {
    return `${green(
      'Success!'
    )} The following configurations were made: TBC... `;
  };

  private getFromFiles = async (filenames: string[]) => {
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
    const markdown = this.configurationObjects.markdown.join('\n\n');
    await fs.promises
      .writeFile(path.join(this.root, 'README.md'), markdown)
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
          path.join(this.root, file),
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
