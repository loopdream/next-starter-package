import path from 'path';
import fs from 'fs';
import prompts from 'prompts';

import { oops } from '../utils.js';
import configurations, { NextConfigType } from './configurations/index.js';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';

type NextraPropsType = {
  projectDirectoryPath: string;
  packageManagerChoice: PackageManagerKindEnum;
};

export class Nextra {
  private root: string;
  private configsPath: string;
  private markdownDirPath: string;
  private readeMarkdownArr: string[];
  private nextConfig = {} as NextConfigType;
  private packageManager = {} as PackageManager;
  private promptAnswers = {} as prompts.Answers<string>;

  constructor({ projectDirectoryPath, packageManagerChoice }: NextraPropsType) {
    this.configsPath = path.resolve(path.join('src', 'templates'));
    this.markdownDirPath = path.resolve(path.join('src', 'markdown'));
    this.root = path.resolve(projectDirectoryPath);
    this.readeMarkdownArr = [];

    this.packageManager = new PackageManager({
      packageManagerKind: packageManagerChoice,
      root: this.root,
    });
  }

  public setPromptAnswers = (answers: prompts.Answers<string>) => {
    if (!answers) throw new Error('Nextra: answers is undefined');
    this.promptAnswers = answers;
  };

  public createNextApp = async () => {
    const packageManagerKind = this.packageManager.getKind();
    const { root } = this;

    this.nextConfig = await configurations.createNextApp({
      packageManagerKind,
      root,
    });

    return this.nextConfig;
  };

  public getNextConfig = () => {
    return this.nextConfig;
  };

  public configureCypress = async () => {
    const { configsPath, packageManager, root } = this;
    await configurations.cypress({
      configsPath,
      packageManager,
      root,
    });
    this.addToReadme('cypress');
  };

  public configureDocker = async () => {
    const { configsPath, root } = this;
    await configurations.docker({ configsPath, root });
    this.addToReadme('docker');
  };

  public configureEnvVars = async () => {
    const { configsPath, root } = this;
    await configurations.envVars({ configsPath, root });
  };

  public configureGitHusky = async () => {
    const { packageManager, root } = this;
    await configurations.gitHusky({ packageManager, root });

    this.addToReadme('git');
    this.addToReadme('husky');
  };

  public configureJestRTL = async () => {
    const { configsPath, nextConfig, packageManager, root } = this;
    await configurations.jestRTL({
      configsPath,
      nextConfig,
      packageManager,
      root,
    });
    this.addToReadme('jestRTL');
  };

  public configureLintStaged = async () => {
    const { configsPath, packageManager, root } = this;
    await configurations.lintStaged({
      configsPath,
      packageManager,
      root,
    });
    this.addToReadme('lint-staged');
  };

  public configureNext = async () => {
    const { configsPath, packageManager, root } = this;
    await configurations.next({
      configsPath,
      packageManager,
      root,
      useNextImageOptimisation: this.promptAnswers.useNextImageOptimisation,
    });
    this.addToReadme('next');
  };

  public configureStorybook = async () => {
    const { configsPath, packageManager, root } = this;
    await configurations.storybook({ configsPath, packageManager, root });
    this.addToReadme('storybook');
  };

  public configurePrettier = async () => {
    const { configsPath, nextConfig, packageManager, root } = this;
    await configurations.prettier({
      configsPath,
      nextConfig,
      packageManager,
      root,
    });
    this.addToReadme('prettier');
  };

  public configureSelectedDependencies = async (
    selectedDependencies: prompts.Answers<string>
  ) => {
    await configurations.selectedDependencies({
      packageManager: this.packageManager,
      selectedDependencies,
    });
    this.addToReadme('selected-dependencies');
  };

  public cleanUp = async () => {
    // clean up ie format files + write Readme - maybe other stuff TBC
    await configurations.cleanUp({
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.generateReadme();
  };

  private addToReadme = async (markdownFileName: string) => {
    const filepath = path.join(this.markdownDirPath, `${markdownFileName}.md`);

    if (fs.existsSync(filepath)) {
      try {
        const markdown = await fs.promises.readFile(filepath, 'utf8');
        this.readeMarkdownArr.push(markdown);
      } catch (error) {
        oops();
        throw new Error(`${error}`);
      }
    }
  };

  private generateReadme = async () => {
    try {
      const markdown = this.readeMarkdownArr.join('\n\n');
      await fs.promises.writeFile(path.join(this.root, 'README.md'), markdown);
    } catch (error) {
      oops();
      throw new Error(`${error}`);
    }
  };
}
