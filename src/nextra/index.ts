import path from 'path';
import fs from 'fs';

import prompts from 'prompts';

import configurations, { NextConfigType } from './configurations/index.js';

import PackageManager, { PackageManagerKindEnum } from './usePackageManager.js';
import readmeGen from './readmeGen.js';

type NextraType = {
  configsPath: string;
  root: string;
  packageManagerChoice: PackageManagerKindEnum;
};

export class Nextra {
  private configsPath;
  private markdownFilePaths = {} as Record<string, string>;

  private nextConfig = {} as NextConfigType;
  private packageManager = {} as PackageManager;
  private promptAnswers = {} as prompts.Answers<string>;
  private readmeGen = {} as readmeGen;
  private root;

  constructor({ configsPath, packageManagerChoice, root }: NextraType) {
    this.configsPath = configsPath;
    this.root = root; // root of affected next directory

    // TODO: fix readmeGen not working
    this.readmeGen = new readmeGen(this.root);
    this.packageManager = new PackageManager({
      packageManagerKind: packageManagerChoice,
      root,
    });

    this.setMarkdownFilePaths();
  }

  private setMarkdownFilePaths = async () => {
    const markdownDirPath = path.resolve(path.join('src', 'markdown'));
    const markdownFilenames = await fs.promises.readdir(markdownDirPath);

    this.markdownFilePaths = markdownFilenames.reduce((acc, filename) => {
      const filenameWithoutExtention = filename.split('.')[0];
      const filePath = path.join(markdownDirPath, filename);
      return { ...acc, [filenameWithoutExtention]: filePath };
    }, {});
  };

  public setPromptAnswers = (answers: prompts.Answers<string>) => {
    if (!answers) throw new Error('Nextra: answers is undefined');
    this.promptAnswers = answers;
  };

  public createNextApp = async () => {
    this.nextConfig = await configurations.createNextApp({
      packageManagerKind: this.packageManager.getKind(),
      root: this.root,
    });
  };

  public configureCypress = async () => {
    await configurations.cypress({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
    });
    await this.readmeGen.addMarkdown(this.markdownFilePaths.cypress);
  };

  public configureDocker = async () => {
    await configurations.docker({
      configsPath: this.configsPath,
      root: this.root,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.docker);
  };

  public configureEnvVars = async () => {
    await configurations.envVars({
      configsPath: this.configsPath,
      root: this.root,
    });
  };

  public configureGitHusky = async () => {
    await configurations.gitHusky({
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.gitHusky);
    await this.readmeGen.addMarkdown(this.markdownFilePaths.husky);
  };

  public configureJestRTL = async () => {
    await configurations.jestRTL({
      configsPath: this.configsPath,
      nextConfig: this.nextConfig,
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.jestRTL);
  };

  public configureLintStaged = async () => {
    await configurations.lintStaged({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.lintStaged);
  };

  public configureNext = async () => {
    await configurations.next({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
      useNextImageOptimisation: this.promptAnswers.useNextImageOptimisation,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.next);
  };

  public configureStorybook = async () => {
    await configurations.storybook({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.storybook);
  };

  public configurePrettier = async () => {
    await configurations.prettier({
      configsPath: this.configsPath,
      nextConfig: this.nextConfig,
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.readmeGen.addMarkdown(this.markdownFilePaths.prettier);
  };

  public configureSelectedDependencies = async (
    selectedDependencies: prompts.Answers<string>
  ) => {
    await configurations.selectedDependencies({
      packageManager: this.packageManager,
      selectedDependencies,
    });

    await this.readmeGen.addMarkdown(
      this.markdownFilePaths.selectedDependencies
    );
  };

  public cleanUp = async () => {
    // clean up ie format files + write Readme - maybe other stuff TBC
    await configurations.cleanUp({
      packageManager: this.packageManager,
      root: this.root,
    });

    await this.readmeGen.generate();
  };
}
