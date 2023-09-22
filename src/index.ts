#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompt from 'prompts';

import { usePackageManager } from './utils/index.js';

import nextra from './configurations/index.js';
import questions from './questions.js';

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

    const { packageManagerChoice } = await prompt(
      questions.packageManagerPrompt
    );

    const packageManager = usePackageManager({
      packageManager: packageManagerChoice,
      root,
    });

    const nextConfig = await nextra.installNext({
      root,
      packageManager,
    });

    const answers = await prompt([
      questions.useNextStandalone,
      questions.useNextImageOptimisation,
      questions.usePrettier,
      questions.useJestRTL,
      questions.useLintStaged,
      questions.useStorybook,
      questions.useHusky,
      questions.useDocker,
      questions.useCypress,
      questions.useSelectedDependencies,
    ]);

    const configureProps = {
      answers,
      configsPath,
      nextConfig,
      packageManager,
      root,
    };

    await nextra.configureNext(configureProps);

    if (answers.useNextImageOptimisation) {
      // https://nextjs.org/docs/app/building-your-application/optimizing/images
      await packageManager.addToDependencies({
        dependencies: ['prettier'],
      });
    }

    if (answers.usePrettier) {
      await nextra.configurePrettier(configureProps);
    }

    if (answers.useJestRTL) {
      await nextra.configureJestRTL(configureProps);
    }

    if (answers.useCypress) {
      await nextra.configureCypress(configureProps);
    }

    if (answers.useLintStaged) {
      await nextra.configureLintStaged(configureProps);
    }

    if (answers.useHusky) {
      await nextra.configureGitHusky(configureProps);
    }

    if (answers.useStorybook) {
      await nextra.configureStorybook(configureProps);
    }

    if (answers.useDocker) {
      await nextra.configureDocker(configureProps);
      await nextra.configureEnvVars(configureProps);
    }

    if (answers.useSelectedDependencies.length > 0)
      await nextra.configureSelectedDependencies({
        ...configureProps,
        selectedDependencies: answers.useSelectedDependencies,
      });

    if (answers.usePrettier) {
      await nextra.cleanUp(configureProps);
    }
  });

program.parse();

export default program;
