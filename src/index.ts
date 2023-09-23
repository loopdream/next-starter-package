#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompt from 'prompts';

import { PackageManager, goodbye } from './utils/index.js';

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
    const markdownPath = path.resolve(path.join('src', 'markdown'));

    const { packageManagerChoice } = await prompt(
      questions.packageManagerPrompt
    );

    const packageManager = new PackageManager({
      packageManagerKind: packageManagerChoice,
      root,
    });

    const nextraa = new Nextra({
      configsPath,
      packageManager,
      root,
    });

    await nextraa.createNextApp();
    await nextraa.addMarkdown(path.join(markdownPath, 'next.md'));

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

    if (!hasAnswers) {
      // nothing to configure!
      goodbye();
      return console.log(`
Looks like you've passed on all the Netxra configuration options. Maybe next time! 
Thanks for using Nextra!
`);
    }

    await nextraa.configure().next();

    if (answers.useNextImageOptimisation) {
      // https://nextjs.org/docs/app/building-your-application/optimizing/images
      await packageManager.addToDependencies({
        dependencies: ['sharp'],
      });
    }

    if (answers.usePrettier) {
      await nextraa.configure().prettier();
      await nextraa.addMarkdown(path.join(markdownPath, 'prettier.md'));
    }

    if (answers.useJestRTL) {
      await nextraa.configure().jestRTL();
      await nextraa.addMarkdown(path.join(markdownPath, 'jestRTL.md'));
    }

    if (answers.useCypress) {
      await nextraa.configure().cypress();
      await nextraa.addMarkdown(path.join(markdownPath, 'cypress.md'));
    }

    if (answers.useLintStaged) {
      await nextraa.configure().lintStaged();
      await nextraa.addMarkdown(path.join(markdownPath, 'lint-staged.md'));
    }

    if (answers.useHusky) {
      await nextraa.configure().gitHusky();
      await nextraa.addMarkdown(path.join(markdownPath, 'git.md'));
      await nextraa.addMarkdown(path.join(markdownPath, 'husky.md'));
    }

    if (answers.useStorybook) {
      await nextraa.configure().storybook();
      await nextraa.addMarkdown(path.join(markdownPath, 'storybook.md'));
    }

    if (answers.useDocker) {
      await nextraa.configure().docker();
      await nextraa.configure().envVars();
      await nextraa.addMarkdown(path.join(markdownPath, 'docker.md'));
    }

    if (answers.useSelectedDependencies.length > 0) {
      await nextraa
        .configure()
        .selectedDependencies(answers.useSelectedDependencies);

      await nextraa.addMarkdown(
        path.join(markdownPath, 'selected-dependencies.md')
      );
    }

    if (answers.usePrettier) {
      // clean up ie format files - maybe other stuff TBC
      await nextraa.configure().cleanUp();
    }

    await nextraa.generateMarkdown();
  });

program.parse();

export default program;
