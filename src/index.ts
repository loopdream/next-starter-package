#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import runPrompts from 'prompts';

import { usePackageManager } from './utils/index.js';

import nextra from './configurations/index.js';
import prompts from './prompts.js';

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

    const { packageManagerChoice } = await runPrompts(
      prompts.packageManagerPrompt
    );

    const packageManager = usePackageManager({
      packageManager: packageManagerChoice,
      root,
    });

    const nextConfig = await nextra.installNext({
      root,
      packageManager,
    });

    const choices = await runPrompts([
      prompts.useNextStandalone,
      prompts.useNextImageOptimisation,
      prompts.usePrettier,
      prompts.useJestRTL,
      prompts.useLintStaged,
      prompts.useStorybook,
      prompts.useHusky,
      prompts.useDocker,
      prompts.useCypress,
      prompts.useSelectedDependencies,
    ]);

    const configureProps = {
      choices,
      configsPath,
      nextConfig,
      packageManager,
      root,
    };

    await nextra.configureNext(configureProps);

    if (choices.useNextImageOptimisation) {
      // https://nextjs.org/docs/app/building-your-application/optimizing/images
      await packageManager.addToDependencies({
        dependencies: ['prettier'],
      });
    }

    if (choices.usePrettier) {
      await nextra.configurePrettier(configureProps);
    }

    if (choices.useJestRTL) {
      await nextra.configureJestRTL(configureProps);
    }

    if (choices.useCypress) {
      await nextra.configureCypress(configureProps);
    }

    if (choices.useLintStaged) {
      await nextra.configureLintStaged(configureProps);
    }

    if (choices.useHusky) {
      await nextra.configureGitHusky(configureProps);
    }

    if (choices.useStorybook) {
      await nextra.configureStorybook(configureProps);
    }

    if (choices.useDocker) {
      await nextra.configureDocker(configureProps);
      await nextra.configureEnvVars(configureProps);
    }

    if (choices.useSelectedDependencies.length > 0)
      await nextra.configureSelectedDependencies({
        ...configureProps,
        selectedDependencies: choices.useSelectedDependencies,
      });

    if (choices.usePrettier) {
      await nextra.cleanUp(configureProps);
    }
  });

program.parse();

export default program;
