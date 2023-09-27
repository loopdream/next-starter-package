import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
import { markdownTable } from 'markdown-table';

import { oops } from './utils.js';
import configurations, { NextConfigType } from './configurations/index.js';
import { ChoiceValuesType } from './questions.js';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';

type NextraPropsType = {
  projectDirectoryPath: string;
  packageManagerChoice: PackageManagerKindEnum;
};

class Nextra {
  private root: string;
  private configsPath: string;
  private markdownDirPath: string;
  private readmeMarkdownArr: string[];
  private nextConfig = {} as NextConfigType;
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
    this.nextConfig = await configurations.createNextApp({
      packageManagerKind: this.packageManager.getKind(),
      root: this.root,
    });

    return this.nextConfig;
  };

  public getNextConfig = () => {
    return this.nextConfig;
  };

  public configureCypress = async () => {
    await configurations.cypress({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
    });
    await this.addMarkdownFragmentToReadmeArr('cypress');
  };

  public configureDocker = async () => {
    await configurations.docker({
      configsPath: this.configsPath,
      root: this.root,
    });
    await this.addMarkdownFragmentToReadmeArr('docker');
  };

  public configureEnvVars = async () => {
    await configurations.envVars({
      configsPath: this.configsPath,
      root: this.root,
    });
  };

  public configureGitHusky = async () => {
    await configurations.gitHusky({
      packageManagerKind: this.packageManager.getKind(),
      root: this.root,
    });

    await this.addMarkdownFragmentToReadmeArr('git');
    await this.addMarkdownFragmentToReadmeArr('husky');
  };

  public configureJestRTL = async () => {
    await configurations.jestRTL({
      configsPath: this.configsPath,
      nextConfig: this.nextConfig,
      packageManager: this.packageManager,
      root: this.root,
    });
    await this.addMarkdownFragmentToReadmeArr('jestRTL');
  };

  public configureLintStaged = async () => {
    await configurations.lintStaged({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
    });
    await this.addMarkdownFragmentToReadmeArr('lint-staged');
  };

  public configureNext = async () => {
    await configurations.next({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
      configureNextImageOptimisation:
        this.promptAnswers.configureNextImageOptimisation,
    });
    await this.addMarkdownFragmentToReadmeArr('next');
  };

  public configureStorybook = async () => {
    await configurations.storybook({
      configsPath: this.configsPath,
      packageManager: this.packageManager,
      root: this.root,
    });
    await this.addMarkdownFragmentToReadmeArr('storybook');
  };

  public configurePrettier = async () => {
    await configurations.prettier({
      configsPath: this.configsPath,
      nextConfig: this.nextConfig,
      packageManager: this.packageManager,
      root: this.root,
    });
    await this.addMarkdownFragmentToReadmeArr('prettier');
  };

  public configureSelectedDependencies = async (
    selectedDependencies: [] | ChoiceValuesType[]
  ) => {
    if (!selectedDependencies || selectedDependencies.length === 0) return;

    await configurations.selectedDependencies({
      packageManager: this.packageManager,
      selectedDependencies,
    });
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
  };

  public cleanUp = async () => {
    // clean up ie format files + write Readme - maybe other stuff TBC
    if (this.promptAnswers.configurePrettier) {
      await configurations.cleanUp({
        packageManagerKind: this.packageManager.getKind(),
        root: this.root,
      });
    }

    await this.generateReadme();
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
}

export default Nextra;
