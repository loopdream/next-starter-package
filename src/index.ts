#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompt from 'prompts';

import { goodbye } from './utils.js';

import { Nextra } from './nextra/index.js';
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
    const configsPath = path.resolve(path.join('src', 'templates'));

    const { packageManagerChoice } = await prompt(
      questions.packageManagerPrompt
    );

    const nextra = new Nextra({
      configsPath,
      packageManagerChoice,
      root,
    });

    const nextConfig = await nextra.createNextApp();

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

    const hasAnswers =
      Object.values(answers).filter((c: boolean) => c === true).length > 1;

    if (hasAnswers) {
      nextra.setPromptAnswers(answers);
    } else {
      // nothing to configure!
      goodbye();
      return console.log(`
Looks like you've passed on all the Netxra configuration options. Maybe next time! 
Thanks for using Nextra!
`);
    }

    await nextra.configureNext();

    if (answers.usePrettier) {
      await nextra.configurePrettier();
    }

    if (answers.useJestRTL) {
      await nextra.configureJestRTL();
    }

    if (answers.useCypress) {
      await nextra.configureCypress();
    }

    if ((nextConfig.eslint || answers.usePrettier) && answers.useLintStaged) {
      await nextra.configureLintStaged();
    }

    if (answers.useHusky)
      if (answers.useStorybook) {
        await nextra.configureStorybook();
      }

    if (answers.useDocker) {
      await nextra.configureDocker();
      await nextra.configureEnvVars();
    }

    if (answers.useSelectedDependencies.length > 0) {
      await nextra.configureSelectedDependencies(
        answers.useSelectedDependencies
      );
    }

    if (answers.usePrettier) {
      await nextra.cleanUp();
    }
  });

program.parse();

export default program;
