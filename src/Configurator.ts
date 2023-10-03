import path from 'path';
import fs from 'fs';
import ora from 'ora';
import picocolors from 'picocolors';
import { $ } from 'execa';

import prompts from 'prompts';

import { oops } from './utils.js';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';

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
  private configurationObjects = {
    markdown: [],
    configFiles: [],
    configDirectories: [],
    packageScripts: {},
    packageDependencies: [],
    packageDevDependencies: [],
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
    const artifactExists = (fileName: string) =>
      fs.existsSync(path.join(this.root, fileName));

    const typescript = artifactExists('tsconfig.json') || false;
    this.nextConfig = {
      appRouter: !artifactExists('src/pages') || false,
      eslint: artifactExists('.eslintrc.json') || false,
      tailwind:
        artifactExists(`tailwind.config.${typescript ? 'ts' : 'js'}`) || false,
      srcDir: artifactExists('src') || false,
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

    // Next updates to default config
    this.configurationObjects.configFiles.push('next.config.js');
    this.configurationObjects.packageScripts = {
      ...this.configurationObjects.packageScripts,
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
      'build-start': `next build && next start`,
      'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
    };
    if (this.promptAnswers.configureNextImageOptimisation) {
      this.configurationObjects.packageDependencies.push('sharp');
    }
    await this.addMarkdownFragmentToMarkdownArr('jestRTL');

    // CYPRESS
    if (configureCypress) {
      this.configurationObjects.configDirectories.push('cypress');
      this.configurationObjects.packageDevDependencies.push('cypress');
      this.configurationObjects.packageScripts = {
        ...this.configurationObjects.packageScripts,
        e2e: 'cypress run',
      };
      await this.addMarkdownFragmentToMarkdownArr('cypress');
    }

    // DOCKER
    if (configureDocker) {
      this.configurationObjects.configFiles.push(
        ...['docker-compose.yml', 'Dockerfile', 'Makefile']
      );
      this.addMarkdownFragmentToMarkdownArr('cypdockerress');
    }

    // PRETTIER
    if (configurePrettier) {
      this.configurationObjects.configFiles.push(
        ...['.prettierrc.json', '.prettierignore']
      );
      this.configurationObjects.packageDevDependencies.push(
        ...['prettier', 'eslint-config-prettier']
      );
      if (!this.nextConfig.eslint) {
        this.configurationObjects.packageDevDependencies.push('eslint');
      }
      this.configurationObjects.packageScripts = {
        ...this.configurationObjects.packageScripts,
        'format:check': 'prettier --check .',
        'format:write': 'prettier --write .',
      };
      await this.addMarkdownFragmentToMarkdownArr('prettier');
    }

    // STORYBOOK
    if (configureStorybook) {
      this.configurationObjects.configDirectories.push('.storybook');
      this.configurationObjects.packageDevDependencies.push(
        ...[
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
      );
      this.configurationObjects.packageScripts = {
        ...this.configurationObjects.packageScripts,
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build',
      };
      await this.addMarkdownFragmentToMarkdownArr('storybook');
    }

    // JEST / RTL
    if (configureJestRTL) {
      this.configurationObjects.configFiles.push('jest.config.js');
      this.configurationObjects.packageDevDependencies.push(
        ...[
          'jest',
          'jest-environment-jsdom',
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react',
          'cypress',
          'eslint-plugin-testing-library',
        ]
      );
      this.configurationObjects.packageScripts = {
        ...this.configurationObjects.packageScripts,
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        'test:ci': 'jest --ci --coverage',
      };
      await this.addMarkdownFragmentToMarkdownArr('jestRTL');
    }

    // HUSKY
    if (configureHusky) {
      await this.addMarkdownFragmentToMarkdownArr('git');
      await this.addMarkdownFragmentToMarkdownArr('husky');
    }

    // SELECTED DEPENDENCIES
    if (
      configureSelectedDependencies &&
      configureSelectedDependencies.length > 0
    ) {
      const dependencies = this.promptAnswers.configureSelectedDependencies
        .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
        .map(({ module }: { module: string }) => module);

      const devDependencies = this.promptAnswers.configureSelectedDependencies
        .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
        .map(({ module }: { module: string }) => module);

      this.configurationObjects.packageDependencies.push(...dependencies);
      this.configurationObjects.packageDevDependencies.push(...devDependencies);
    }

    return this.configurationObjects;
  };

  public installConfigureGitHusky = async () => {
    const $execa = $({ cwd: this.root });
    const pm = this.packageManager.getKind();

    this.spinner.start('Configuring Git and Husky');

    await $execa`git init`;

    let huskyInit = 'npx husky-init && npm install';

    if (pm === PackageManagerKindEnum.YARN) {
      huskyInit = 'yarn dlx husky-init --yarn2 && yarn';
    }

    if (pm === PackageManagerKindEnum.PNPM) {
      huskyInit = 'pnpm dlx husky-init && pnpm install';
    }

    if (pm === PackageManagerKindEnum.BUN) {
      huskyInit = 'bunx husky-init && bun install';
    }

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
    const { packageScripts } = this.configurationObjects;

    // package scripts
    await this.packageManager.addToPackage('scripts', packageScripts);

    // lint-staged
    if ((configureLintStaged && this.nextConfig.eslint) || configurePrettier) {
      const lintStaged: Record<string, string[]> = {
        '**/*.{js,jsx}': ['lint:check', 'lint:fix', 'format:write'],
        '**/*.{ts,tsx}': [
          'lint:check',
          'lint:fix',
          'format:write',
          'build --noEmit',
        ],
        '**/*.css': ['format:write', 'stylelint'],
        '**/*.{md, yml, yaml}': ['format:write'],
      };
      await this.packageManager.addToPackage('lint-staged', lintStaged);
    }
  };

  public configureEslint = async () => {
    const { configurePrettier, configureStorybook } = this.promptAnswers;
    const { packageDevDependencies } = this.configurationObjects;

    const hasPrettier =
      configurePrettier && packageDevDependencies.includes('prettier');
    const hasTsEslint = packageDevDependencies.includes(
      'eslint-config-prettier'
    );

    const hasStorybook =
      configureStorybook &&
      packageDevDependencies.includes('eslint-plugin-storybook');

    const hasRTL = packageDevDependencies.includes('@testing-library/react');

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

  private addMarkdownFragmentToMarkdownArr = async (
    markdownFileName: string
  ) => {
    const markdownFilePath = path.join(
      this.markdownDirPath,
      `${markdownFileName}.md`
    );

    if (fs.existsSync(markdownFilePath)) {
      await fs.promises
        .readFile(markdownFilePath, 'utf8')
        .then((markdown) => this.configurationObjects.markdown.push(markdown))
        .catch((error) => {
          oops();
          throw new Error(`${error}`);
        });
    }
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
