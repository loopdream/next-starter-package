import path from 'path';
import fs from 'fs';
import ora from 'ora';
import picocolors from 'picocolors';
import { $ } from 'execa';

import prompts from 'prompts';
import { markdownTable } from 'markdown-table';

import { oops } from './utils.js';
import { ChoiceValuesType } from './questions.js';

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

const { green } = picocolors;

class Nextra {
  private root: string;
  private configsPath: string;
  private markdownDirPath: string;
  private readmeMarkdownArr: string[];
  private nextConfig = {} as NextJsConfigType;
  private packageManager = {} as PackageManager;
  private promptAnswers = {} as prompts.Answers<string>;
  private spinner;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: NextraPropsType) {
    this.configsPath = path.resolve(path.join('src', 'templates'));
    this.markdownDirPath = path.resolve(path.join('src', 'markdown'));
    this.root = path.resolve(projectDirectoryPath);
    this.readmeMarkdownArr = [];
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
    try {
      console.log(`\n`);
      await $({
        stdio: 'inherit',
      })`npx create-next-app@latest ${this.root} --use-${pm}`;
    } catch (error) {
      oops();
      throw new Error(`\n${error}`);
    }

    return this.getNextConfig();
  };

  public getNextConfig = () => {
    const artifactExists = (fileName: string) => {
      try {
        return fs.existsSync(path.join(this.root, fileName));
      } catch (e) {
        console.log({ e });
      }
    };

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

  public configureCypress = async () => {
    this.spinner.start('Configuring Cypress');

    try {
      await this.packageManager.addToDevDependencies(['cypress']);

      await this.copyTemplate('cypress', true);
      //await this.packageManager.addToScripts({ e2e: 'cypress run' });
      await this.packageManager.addToPackage('scripts', { e2e: 'cypress run' });

      await this.addMarkdownFragmentToReadmeArr('cypress');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Cypress');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureDocker = async () => {
    this.spinner.start('Configuring Docker');

    try {
      await this.copyTemplate(['docker-compose.yml', 'Dockerfile', 'Makefile']);
      await this.addMarkdownFragmentToReadmeArr('docker');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Docker');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureEnvVars = async (dotEnvFileArr: string[]) => {
    this.spinner.start('Adding Environment variables');

    try {
      // const copyEnvFiles = dotEnvFileArr.map((file) =>
      //   fs.promises.cp(
      //     path.join(this.configsPath, '.env.example'),
      //     path.join(this.root, file)
      //   )
      // );

      const copyEnvFiles = dotEnvFileArr.map(
        (file) => $`touch ${path.join(this.root, file)}`
      );

      await Promise.all(copyEnvFiles);

      if (fs.existsSync(path.join(this.root, '.gitignore'))) {
        await fs.promises.appendFile(
          path.join(this.root, '.gitignore'),
          `# env files
          .env
          .env.local`
        );
      }

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error adding Environment variables');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureGitHusky = async () => {
    const $execa = $({ cwd: this.root });
    const pm = this.packageManager.getKind();

    this.spinner.start('Configuring Git and Husky');

    try {
      await $execa`git init`;

      if (pm === PackageManagerKindEnum.YARN) {
        await $execa`yarn dlx husky-init --yarn2 && yarn`;
      }

      if (pm === PackageManagerKindEnum.PNPM) {
        await $execa`pnpm dlx husky-init && pnpm install`;
      }

      if (pm === PackageManagerKindEnum.NPM) {
        await $execa`npx husky-init && npm install`;
      }

      if (pm === PackageManagerKindEnum.BUN) {
        await $execa`bunx husky-init && bun install`;
      }

      await this.addMarkdownFragmentToReadmeArr('git');
      await this.addMarkdownFragmentToReadmeArr('husky');

      // rewrite husky pre-commit commands based on choices
      const huskyPreCommitStr =
        `#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"` +
        (this.nextConfig.eslint
          ? `\n\nnpm run lint:check\n\nnpm run lint:fix`
          : '') +
        (this.promptAnswers.configurePrettier
          ? `\n\nnpm run format:write`
          : '');

      await fs.promises.writeFile(
        path.join(this.root, '.husky', 'pre-commit'),
        huskyPreCommitStr,
        'utf8'
      );

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Git and Husky');
      oops();
      throw new Error(`${error}`);
    }
  };

  public configureJestRTL = async () => {
    this.spinner.start('Configuring Jest and React Testing Library');

    try {
      await this.packageManager.addToDevDependencies([
        'jest',
        'jest-environment-jsdom',
        '@testing-library/jest-dom',
        '@testing-library/user-event',
        '@testing-library/react',
        'cypress',
        'eslint-plugin-testing-library',
      ]);

      await this.copyTemplate('jest.config.js');

      if (this.nextConfig.typescript) {
        fs.promises.rename(
          path.join(this.root, 'jest.config.js'),
          path.join(this.root, 'jest.config.ts')
        );
      }

      await this.packageManager.addToPackage('scripts', {
        test: 'jest --watch',
        'test:ci': 'jest --ci',
      });

      await this.addMarkdownFragmentToReadmeArr('jestRTL');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Jest and React Testing Library');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureLintStaged = async () => {
    this.spinner.start('Configuring Lint-staged');

    try {
      await this.packageManager.addToDevDependencies(['lint-staged']);

      await this.copyTemplate('.lintstagedrc');

      await this.packageManager.addToPackage('scripts', {
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build',
      });

      await this.addMarkdownFragmentToReadmeArr('lint-staged');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Lint-staged');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureEslint = async () => {};

  public configureNext = async () => {
    this.spinner.start('Configuring next standalone production builds');

    try {
      // add standalone next config and build/start scripts
      // https://nextjs.org/docs/pages/api-reference/next-config-js/output

      const pm = this.packageManager.getKind();

      await this.packageManager.addToPackage('scripts', {
        'build:standalone': 'BUILD_STANDALONE=true next build',
        'start:standalone': 'node ./.next/standalone/server.js',
        'build-start': `next build && next start`,
        'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
      });

      // https://nextjs.org/docs/app/building-your-application/optimizing/images
      if (this.promptAnswers.configureNextImageOptimisation) {
        await this.packageManager.addToDependencies(['sharp']);
      }

      await this.copyTemplate('next.config.js');

      await this.addMarkdownFragmentToReadmeArr('next');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring next standalone production builds');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureStorybook = async () => {
    this.spinner.start('Configuring Storybook');

    try {
      await this.packageManager.addToDevDependencies([
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
      ]);

      await this.copyTemplate('.storybook', true);

      await this.packageManager.addToPackage('scripts', {
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build',
      });

      await this.addMarkdownFragmentToReadmeArr('storybook');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Storybook');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configurePrettier = async () => {
    this.spinner.start('Configuring Eslint and Prettier');

    try {
      const dependencies = [
        'prettier',
        'eslint-config-prettier',
        '@typescript-eslint/eslint-plugin',
      ];

      if (!this.nextConfig.eslint) dependencies.push('eslint');

      await this.packageManager.addToDevDependencies(dependencies);

      const copyConfigs = [
        '.eslintrc.json',
        '.prettierrc.json',
        '.prettierignore',
      ].map((config) => this.copyTemplate(config));

      await Promise.all(copyConfigs);

      await this.packageManager.addToPackage('scripts', {
        'lint:check': 'eslint .',
        'lint:fix': 'eslint --fix .',
        'format:check': 'prettier --check .',
        'format:write': 'prettier --write .',
      });

      await this.addMarkdownFragmentToReadmeArr('prettier');

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring Eslint and Prettier');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureSelectedDependencies = async (
    selectedDependencies: [] | ChoiceValuesType[]
  ) => {
    if (!selectedDependencies || selectedDependencies.length === 0) return;

    this.spinner.start('Configuring selected packages');

    try {
      const dependencies = selectedDependencies
        .filter(({ saveDev }) => !saveDev)
        .map(({ module }) => module);

      const devDependencies = selectedDependencies
        .filter(({ saveDev }) => saveDev)
        .map(({ module }) => module);

      if (dependencies.length > 0) {
        await this.packageManager.addToDependencies(dependencies);
      }

      if (devDependencies.length > 0) {
        await this.packageManager.addToDevDependencies(devDependencies);
      }

      await this.addMarkdownFragmentToReadmeArr('selected-dependencies');

      // list the selected dependency packages in the readme as a table
      const tableHeader = ['Package name', 'Package description', 'Type'];
      const tableData = selectedDependencies.map(
        ({ module, github, description, saveDev }) => [
          `[${module}](${github})`,
          description,
          saveDev ? '`devDependency`' : '`dependency`',
        ]
      );

      const table = markdownTable([tableHeader, ...tableData]);
      this.readmeMarkdownArr.push(table);

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail('Error configuring selected packages');
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public cleanUp = async () => {
    // clean up ie format files + write Readme - maybe other stuff TBC
    this.spinner.start('Cleaning up');
    try {
      if (this.promptAnswers.configurePrettier) {
        await $({
          cwd: this.root,
        })`${this.packageManager.getKind()} run format:write`;
      }

      await this.generateReadme();

      this.spinner.succeed();
    } catch (error) {
      this.spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }

    return this.configurationCompleteMessage();
  };

  private configurationCompleteMessage = () => {
    return `${green(
      'Success!'
    )} The following configurations were made: TBC... `;
  };

  private addMarkdownFragmentToReadmeArr = async (markdownFileName: string) => {
    const filepath = path.join(this.markdownDirPath, `${markdownFileName}.md`);

    if (fs.existsSync(filepath)) {
      try {
        const markdown = await fs.promises.readFile(filepath, 'utf8');
        this.readmeMarkdownArr.push(markdown);
      } catch (error) {
        oops();
        throw new Error(`${error}`);
      }
    }
  };

  private generateReadme = async () => {
    try {
      const markdown = this.readmeMarkdownArr.join('\n\n');
      await fs.promises.writeFile(path.join(this.root, 'README.md'), markdown);
    } catch (error) {
      oops();
      throw new Error(`${error}`);
    }
  };

  private copyTemplate = async (
    template: string | string[],
    recursive: boolean = false
  ) => {
    if (typeof template === 'string') {
      return await fs.promises.cp(
        path.join(this.configsPath, template),
        path.join(this.root, template),
        { recursive }
      );
    }

    if (Array.isArray(template) && template.length > 0) {
      const copyFiles = template.map((file) =>
        fs.promises.cp(
          path.join(this.configsPath, file),
          path.join(this.root, file)
        )
      );

      return await Promise.all(copyFiles);
    }
  };
}

export default Nextra;
