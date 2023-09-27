import path from 'path';
import fs from 'fs';
import ora from 'ora';
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

class Nextra {
  private root: string;
  private configsPath: string;
  private markdownDirPath: string;
  private readmeMarkdownArr: string[];
  private nextConfig = {} as NextJsConfigType;
  private packageManager = {} as PackageManager;
  private promptAnswers = {} as prompts.Answers<string>;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: NextraPropsType) {
    this.configsPath = path.resolve(path.join('src', 'templates'));
    this.markdownDirPath = path.resolve(path.join('src', 'markdown'));
    this.root = path.resolve(projectDirectoryPath);
    this.readmeMarkdownArr = [];

    this.packageManager = new PackageManager({
      packageManagerKind,
      root: this.root,
    });
  }

  public setPromptAnswers = (answers: prompts.Answers<string>) => {
    if (!answers) throw new Error('Nextra: answers is undefined');
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
    const spinner = ora({ indent: 2, text: 'Configuring Cypress' }).start();

    try {
      await this.packageManager.addToDependencies({
        dependencies: ['cypress'],
        devDependencies: true,
      });

      await this.copyTemplate('cypress', true);
      await this.packageManager.addToScripts({ e2e: 'cypress run' });
      await this.addMarkdownFragmentToReadmeArr('cypress');

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureDocker = async () => {
    const spinner = ora({
      indent: 2,
      text: 'Configuring Docker',
    }).start();

    try {
      await this.copyTemplate(['docker-compose.yml', 'Dockerfile', 'Makefile']);
      await this.addMarkdownFragmentToReadmeArr('docker');

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureEnvVars = async () => {
    const spinner = ora({
      indent: 2,
      text: 'Configuring Environment variables',
    }).start();

    try {
      const envFiles = ['.env.example', '.env.local', '.env'].map((file) =>
        fs.promises.cp(
          path.join(this.configsPath, '.env.example'),
          path.join(this.root, file)
        )
      );

      await Promise.all(envFiles);

      if (fs.existsSync(path.join(this.root, '.gitignore'))) {
        await fs.promises.appendFile(
          path.join(this.root, '.gitignore'),
          `# env files
          .env
          .env.local`
        );
      }

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureGitHusky = async () => {
    const $execa = $({ cwd: this.root });
    const pm = this.packageManager.getKind();

    const spinner = ora({
      indent: 2,
      text: 'Configuring Git and Husky',
    }).start();

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

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      throw new Error(`${error}`);
    }
  };

  public configureJestRTL = async () => {
    const spinner = ora({
      indent: 2,
      text: 'Configuring Jest and React Testing Library',
    }).start();

    try {
      await this.packageManager.addToDependencies({
        dependencies: [
          'jest',
          'jest-environment-jsdom',
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react',
          'cypress',
          'eslint-plugin-testing-library',
        ],
        devDependencies: true,
      });

      await this.copyTemplate('jest.config.js');

      if (this.nextConfig.typescript) {
        fs.promises.rename(
          path.join(this.root, 'jest.config.js'),
          path.join(this.root, 'jest.config.ts')
        );
      }

      await this.packageManager.addToScripts({
        test: 'jest --watch',
        'test:ci': 'jest --ci',
      });

      await this.addMarkdownFragmentToReadmeArr('jestRTL');

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureLintStaged = async () => {
    const spinner = ora({
      indent: 2,
      text: 'Configuring Lint-staged',
    }).start();

    try {
      await this.packageManager.addToDependencies({
        dependencies: ['lint-staged'],
        devDependencies: true,
      });

      await this.copyTemplate('.lintstagedrc');

      await this.packageManager.addToScripts({
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build',
      });

      await this.addMarkdownFragmentToReadmeArr('lint-staged');

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureNext = async () => {
    const spinner = ora({
      indent: 2,
      text: 'Configuring next standalone production builds',
    }).start();

    try {
      // add standalone next config and build/start scripts
      // https://nextjs.org/docs/pages/api-reference/next-config-js/output

      const pm = this.packageManager.getKind();

      await this.copyTemplate('next.config.js');

      await this.packageManager.addToScripts({
        'build:standalone': 'BUILD_STANDALONE=true next build',
        'start:standalone': 'node ./.next/standalone/server.js',
        'build-start': `next build && next start`,
        'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
      });

      // https://nextjs.org/docs/app/building-your-application/optimizing/images
      if (this.promptAnswers.configureNextImageOptimisation) {
        await this.packageManager.addToDependencies({
          dependencies: ['sharp'],
        });
      }

      await this.addMarkdownFragmentToReadmeArr('next');

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureStorybook = async () => {
    const addStorybookSpinner = ora({
      indent: 2,
      text: 'Configuring Storybook',
    }).start();

    try {
      await this.packageManager.addToDependencies({
        dependencies: [
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
        ],
        devDependencies: true,
      });

      await this.copyTemplate('.storybook', true);

      await this.packageManager.addToScripts({
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build',
      });

      await this.addMarkdownFragmentToReadmeArr('storybook');

      addStorybookSpinner.succeed();
    } catch (error) {
      addStorybookSpinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configurePrettier = async () => {
    const spinner = ora({
      indent: 2,
      text: 'Configuring Eslint and Prettier',
    }).start();

    try {
      const dependencies = [
        'prettier',
        'eslint-config-prettier',
        '@typescript-eslint/eslint-plugin',
      ];

      if (!this.nextConfig.eslint) dependencies.push('eslint');

      await this.packageManager.addToDependencies({
        dependencies,
        devDependencies: true,
      });

      const copyConfigs = [
        this.copyTemplate('.eslintrc.json'),
        this.copyTemplate('.prettierrc.json'),
        this.copyTemplate('.prettierignore'),
      ];

      await Promise.all(copyConfigs);

      await this.packageManager.addToScripts({
        'lint:check': 'eslint .',
        'lint:fix': 'eslint --fix .',
        'format:check': 'prettier --check .',
        'format:write': 'prettier --write .',
      });

      await this.addMarkdownFragmentToReadmeArr('prettier');

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public configureSelectedDependencies = async (
    selectedDependencies: [] | ChoiceValuesType[]
  ) => {
    if (!selectedDependencies || selectedDependencies.length === 0) return;

    const spinner = ora({
      indent: 2,
      text: 'Adding selected packages',
    }).start();

    try {
      const dependencies = selectedDependencies
        .filter(({ saveDev }) => !saveDev)
        .map(({ module }) => module);

      const devDependencies = selectedDependencies
        .filter(({ saveDev }) => saveDev)
        .map(({ module }) => module);

      if (dependencies.length > 0) {
        await this.packageManager.addToDependencies({ dependencies });
      }

      if (devDependencies.length > 0) {
        await this.packageManager.addToDependencies({
          dependencies: devDependencies,
          devDependencies: true,
        });
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

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
  };

  public cleanUp = async () => {
    // clean up ie format files + write Readme - maybe other stuff TBC

    const spinner = ora({ indent: 2, text: 'Cleaning up' }).start();

    try {
      if (this.promptAnswers.configurePrettier) {
        await $({
          cwd: this.root,
        })`${this.packageManager.getKind()} run format:write`;
      }

      await this.generateReadme();

      spinner.succeed();
    } catch (error) {
      spinner.fail();
      oops();
      throw new Error(`\n${error}`);
    }
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
      await fs.promises.cp(
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

      await Promise.all(copyFiles);
    }
  };
}

export default Nextra;
