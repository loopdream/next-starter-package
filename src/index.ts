#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompts from 'prompts';

import { usePackageManager } from './utils/index.js';

import {
  packageManagerPrompt,
  useCypressPrompt,
  useDockerPrompt,
  useHuskyPrompt,
  useJestRTLPrompt,
  useLintStagedPrompt,
  useNextStandalonePrompt,
  usePrettierPrompt,
  useSelectedDependenciesPrompt,
  useStorybookPrompt,
} from './prompts.js';

import {
  cleanUp,
  configureCypress,
  configureDocker,
  configureEnvVars,
  configureGitHusky,
  configureJestRTL,
  configureLintStaged,
  configureNext,
  configurePrettier,
  configureSelectedDependencies,
  configureStorybook,
  installNext,
} from './functions/index.js';

console.log('\n', figlet.textSync('Nextra'), '\n\n');

program
  .name('qsbaseline')
  .description(`Generate a baseline Next.js app with best practace feature set`)
  .version(`1.0.0`)
  .usage('<projectName> -- [options]')
  .argument('<projectName>')
  .option('-d, --dev', 'my test option')
  .action(async (projectName, options) => {
    let projectDirectoryPath = projectName;

    if (options?.dev) {
      // if the dev flag is passed create a temp directory for the project installation
      // this is for testing as otherwise we would pollute the root dir
      if (!fs.existsSync('./tmp')) await fs.promises.mkdir('./tmp');
      projectDirectoryPath = path.join('tmp', projectName);
    }

    const root = path.resolve(projectDirectoryPath);
    const configsPath = path.resolve(path.join('src', 'configs'));

    const { packageManagerChoice } = await prompts(packageManagerPrompt);

    const packageManager = usePackageManager({
      packageManager: packageManagerChoice,
      root,
    });

    const nextConfig = await installNext({ root, packageManager });

    const choices = await prompts([
      useNextStandalonePrompt,
      usePrettierPrompt,
      useJestRTLPrompt,
      useLintStagedPrompt,
      useStorybookPrompt,
      useHuskyPrompt,
      useCypressPrompt,
      useDockerPrompt,
      useSelectedDependenciesPrompt,
    ]);

    const configureProps = {
      choices,
      configsPath,
      nextConfig,
      packageManager,
      root,
    };

    await configureNext(configureProps);

    if (choices.usePrettier) {
      await configurePrettier(configureProps);
    }

    if (choices.useJestRTL) {
      await configureJestRTL(configureProps);
    }

    if (choices.useCypress) {
      await configureCypress(configureProps);
    }

    if (choices.useLintStaged) {
      await configureLintStaged(configureProps);
    }

    if (choices.useHusky) {
      await configureGitHusky(configureProps);
    }

    if (choices.useStorybook) {
      await configureStorybook(configureProps);
    }

    if (choices.useDocker) {
      await configureDocker(configureProps);
      await configureEnvVars(configureProps);
    }

    if (choices.useSelectedDependencies.length > 0)
      await configureSelectedDependencies({
        ...configureProps,
        selectedDependencies: choices.useSelectedDependencies,
      });

    if (choices.usePrettier) {
      await cleanUp(configureProps);
    }
  });

program.parse();

export default program;
