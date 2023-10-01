import path from 'path';
import fs from 'fs';
import ora from 'ora';
import picocolors from 'picocolors';
import { $ } from 'execa';

import prompts from 'prompts';
// import { markdownTable } from 'markdown-table';

import { oops } from './utils.js';
// import { ChoiceValuesType } from './questions.js';

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

class Configurator {
  private root: string;
  private configsPath: string;
  private markdownDirPath: string;
  private markdownArr: string[];
  private packageScriptsObj: Record<string, string>;
  private configsArr: string[];
  private dependenciesArr: string[];
  private devDepndenciesArr: string[];
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
    this.markdownArr = [];
    this.configsArr = [];
    this.packageScriptsObj = {};
    this.dependenciesArr = [];
    this.devDepndenciesArr = [];
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

  public configure = async () => {
    if (Object.entries(this.promptAnswers).length === 0) return;

    if (this.promptAnswers.configurePrettier) {
      await this.configurePrettier();
    }

    if (this.promptAnswers.configureJestRTL) await this.configureJestRTL();

    if (this.promptAnswers.configureCypress) {
      await this.configureCypress();
    }

    if (
      (this.nextConfig.eslint || this.promptAnswers.configurePrettier) &&
      this.promptAnswers.configureLintStaged
    ) {
      await this.configureLintStaged();
    }

    if (this.promptAnswers.configureHusky) {
      await this.configureGitHusky();
    }

    if (this.promptAnswers.configureStorybook) {
      await this.configureStorybook();
    }

    if (this.promptAnswers.configureDocker) {
      await this.configureDocker();
    }

    if (this.promptAnswers.configureDotEnvFiles.length > 0) {
      await this.configureEnvVars();
    }

    if (this.promptAnswers.configureSelectedDependencies.length > 0) {
      await this.configureSelectedDependencies();
    }

    console.log({
      packageScriptsObj: this.packageScriptsObj,
      configsArr: this.configsArr,
      dependenciesArr: this.dependenciesArr,
      devDepndenciesArr: this.devDepndenciesArr,
      markdownArr: this.markdownArr,
    });

    // generate
  };

  public configureCypress = async () => {
    this.configsArr.push('cypress');
    this.devDepndenciesArr.push('cypress');
    this.packageScriptsObj = {
      ...this.packageScriptsObj,
      e2e: 'cypress run',
    };
    await this.addMarkdownFragmentToMarkdownArr('cypress');
  };

  public configureDocker = async () => {
    this.configsArr.push(...['docker-compose.yml', 'Dockerfile', 'Makefile']);
    this.addMarkdownFragmentToMarkdownArr('cypdockerress');
  };

  public configureEnvVars = async () => {};

  public configureGitHusky = async () => {};

  public configureJestRTL = async () => {
    this.configsArr.push('jest.config.js');
    this.devDepndenciesArr.push(
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

    this.packageScriptsObj = {
      ...this.packageScriptsObj,
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
      'test:ci': 'jest --ci --coverage',
    };

    await this.addMarkdownFragmentToMarkdownArr('jestRTL');
  };

  public configureLintStaged = async () => {};

  public configureEslint = async () => {};

  public configureNext = async () => {
    const pm = this.packageManager.getKind();

    this.configsArr.push('next.config.js');

    this.packageScriptsObj = {
      ...this.packageScriptsObj,
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
      'build-start': `next build && next start`,
      'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
    };

    if (this.promptAnswers.configureNextImageOptimisation) {
      this.dependenciesArr.push('sharp');
    }

    await this.addMarkdownFragmentToMarkdownArr('jestRTL');
  };

  public configureStorybook = async () => {
    this.configsArr.push('.storybook');
    this.devDepndenciesArr.push(
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

    this.packageScriptsObj = {
      ...this.packageScriptsObj,
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build',
    };

    await this.addMarkdownFragmentToMarkdownArr('storybook');
  };

  public configurePrettier = async () => {
    this.configsArr.push(...['.prettierrc.json', '.prettierignore']);

    this.devDepndenciesArr.push(...['prettier', 'eslint-config-prettier']);
    if (!this.nextConfig.eslint) this.devDepndenciesArr.push('eslint');

    this.packageScriptsObj = {
      ...this.packageScriptsObj,
      'format:check': 'prettier --check .',
      'format:write': 'prettier --write .',
    };

    await this.addMarkdownFragmentToMarkdownArr('prettier');
  };

  public configureSelectedDependencies = async () => {
    const dependencies = this.promptAnswers.configureSelectedDependencies
      .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
      .map(({ module }: { module: string }) => module);

    const devDependencies = this.promptAnswers.configureSelectedDependencies
      .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
      .map(({ module }: { module: string }) => module);

    this.dependenciesArr.push(...dependencies);
    this.devDepndenciesArr.push(...devDependencies);
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

  private addMarkdownFragmentToMarkdownArr = async (
    markdownFileName: string
  ) => {
    const filepath = path.join(this.markdownDirPath, `${markdownFileName}.md`);

    if (fs.existsSync(filepath)) {
      try {
        const markdown = await fs.promises.readFile(filepath, 'utf8');
        this.markdownArr.push(markdown);
      } catch (error) {
        oops();
        throw new Error(`${error}`);
      }
    }
  };

  private generateReadme = async () => {
    try {
      const markdown = this.markdownArr.join('\n\n');
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

export default Configurator;
