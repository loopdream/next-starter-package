#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompt from 'prompts';

import { goodbye } from './utils.js';

import Nextra from './Nextra.js';
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

    const { packageManagerChoice } = await prompt(
      questions.packageManagerPrompt
    );

    const nextra = new Nextra({
      projectDirectoryPath,
      packageManagerChoice,
    });

    const nextConfig = await nextra.createNextApp();

    const answers = await prompt([
      questions.configureNextImageOptimisation,
      questions.configurePrettier,
      questions.configureJestRTL,
      questions.configureLintStaged,
      questions.configureCypress,
      questions.configureStorybook,
      questions.configureHusky,
      questions.configureDocker,
      questions.configureDotEnvFiles,
      questions.configureSelectedDependencies,
    ]);

    const hasAnswers =
      Object.values(answers).includes(true) ||
      answers.configureSelectedDependencies.length > 0 ||
      answers.configureDotEnvFiles.length > 0;

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

    console.log(`
    
Using ${packageManagerChoice}.

Configuring project with following configurations:  

`);

    await nextra.configureNext();

    if (answers.configurePrettier) {
      await nextra.configurePrettier();
    }

    if (answers.configureJestRTL) {
      await nextra.configureJestRTL();
    }

    if (answers.configureCypress) {
      await nextra.configureCypress();
    }

    if (
      (nextConfig.eslint || answers.configurePrettier) &&
      answers.configureLintStaged
    ) {
      await nextra.configureLintStaged();
    }

    if (answers.configureHusky) {
      await nextra.configureGitHusky();
    }

    if (answers.configureStorybook) {
      await nextra.configureStorybook();
    }

    if (answers.configureDocker) {
      await nextra.configureDocker();
    }

    if (answers.configureDotEnvFiles.length > 0) {
      await nextra.configureEnvVars(answers.configureDotEnvFiles);
    }

    if (answers.configureSelectedDependencies.length > 0) {
      await nextra.configureSelectedDependencies(
        answers.configureSelectedDependencies
      );
    }

    const configurationCompleteMessage = await nextra.cleanUp();
    console.log(`\n` + configurationCompleteMessage);
  });

program.parse();

export default program;
