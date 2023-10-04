#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompt from 'prompts';

import { goodbye } from './utils.js';

import Configurator from './Configurator.js';
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

    const configurator = new Configurator({
      projectDirectoryPath,
      packageManagerChoice,
    });

    // const nextConfig =
    await configurator.createNextApp();

    const answers = await prompt([
      questions.nextImageOptimisation,
      questions.prettier,
      questions.jest,
      questions.reactTestingLibrary,
      questions.lintStaged,
      questions.cypress,
      questions.storybook,
      questions.husky,
      questions.docker,
      questions.dotEnvFiles,
      questions.optionalDependencies,
    ]);

    const hasAnswers =
      Object.values(answers).includes(true) ||
      answers.optionalDependencies.length > 0 ||
      answers.dotEnvFiles.length > 0;

    if (!hasAnswers) {
      // nothing to configure!
      goodbye();
      return console.log(
        `Looks like you've passed on all the Netxra configuration options. Maybe next time!`
      );
    }

    configurator.setOptions(answers);

    await configurator.run();
  });

program.parse();

export default program;
