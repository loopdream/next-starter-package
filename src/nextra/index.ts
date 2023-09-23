import fs from 'fs';
import path from 'path';

import oops from '../utils/oops.js';

import prompts from 'prompts';
import cleanUp from './cleanUp.js';
import configureCypress from './configureCypress.js';
import configureDocker from './configureDocker.js';
import configureEnvVars from './configureEnvVars.js';
import configureGitHusky from './configureGitHusky.js';
import configureJestRTL from './configureJestRTL.js';
import configureLintStaged from './configureLintStaged.js';
import configureNext from './configureNext.js';
import configurePrettier from './configurePrettier.js';
import configureSelectedDependencies from './configureSelectedDependencies.js';
import configureStorybook from './configureStorybook.js';
import createNextApp, { NextConfigType } from './createNextApp.js';
import { PackageManagerType } from '../utils/usePackageManager.js';

type NextraType = {
  configsPath: string;
  packageManager: PackageManagerType;
  root: string;
};
export class Nextra {
  configsPath;
  markdownArr: string[];
  nextConfig = {} as NextConfigType;
  packageManager;
  root;

  constructor({ configsPath, packageManager, root }: NextraType) {
    this.configsPath = configsPath;
    this.markdownArr = [];
    this.packageManager = packageManager;
    this.root = root;
  }

  public createNextApp = async () => {
    this.nextConfig = await createNextApp({
      packageManagerKind: this.packageManager.getKind(),
      root: this.root,
    });
  };

  public configure = () => {
    const props = {
      configsPath: this.configsPath,
      nextConfig: this.nextConfig,
      packageManager: this.packageManager,
      root: this.root,
    };

    return {
      cleanUp: () => cleanUp(props),
      cypress: () => configureCypress(props),
      docker: () => configureDocker(props),
      envVars: () => configureEnvVars(props),
      gitHusky: () => configureGitHusky(props),
      jestRTL: () => configureJestRTL(props),
      lintStaged: () => configureLintStaged(props),
      next: () => configureNext(props),
      prettier: () => configurePrettier(props),
      selectedDependencies: (selectedDependencies: prompts.Answers<string>) =>
        configureSelectedDependencies({ ...props, selectedDependencies }),
      storybook: () => configureStorybook(props),
    };
  };

  public addMarkdown = async (filepath: string) => {
    if (fs.existsSync(filepath)) {
      try {
        const md = await fs.promises.readFile(filepath, 'utf8');
        this.markdownArr.push(md);
      } catch (error) {
        oops();
        throw new Error(`${error}`);
      }
    }
    return this.addMarkdown;
  };

  public generateMarkdown = async () => {
    try {
      await fs.promises.writeFile(
        path.join(this.root, 'README.md'),
        this.markdownArr.join('\n\n')
      );
    } catch (error) {
      oops();
      throw new Error(`${error}`);
    }
  };
}
