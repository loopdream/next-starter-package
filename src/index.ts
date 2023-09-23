#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import prompt from 'prompts';

import { usePackageManager, ReadmeGen } from './utils/index.js';

import nextra from './nextra/index.js';
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

    const readme = new ReadmeGen(root);

    const { packageManagerChoice } = await prompt(
      questions.packageManagerPrompt
    );

    const packageManager = usePackageManager({
      packageManager: packageManagerChoice,
      root,
    });

    const nextConfig = await nextra.createNextApp({ root, packageManager });
    readme.addMarkdown(path.join(markdownPath, 'next.md'));

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
        dependencies: ['sharp'],
      });
    }

    if (answers.usePrettier) {
      await nextra.configurePrettier(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'prettier.md'));
    }

    if (answers.useJestRTL) {
      await nextra.configureJestRTL(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'jestRTL.md'));
    }

    if (answers.useCypress) {
      await nextra.configureCypress(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'cypress.md'));
    }

    if (answers.useLintStaged) {
      await nextra.configureLintStaged(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'lint-staged.md'));
    }

    if (answers.useHusky) {
      await nextra.configureGitHusky(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'git.md'));
      await readme.addMarkdown(path.join(markdownPath, 'husky.md'));
    }

    if (answers.useStorybook) {
      await nextra.configureStorybook(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'storybook.md'));
    }

    if (answers.useDocker) {
      await nextra.configureDocker(configureProps);
      await nextra.configureEnvVars(configureProps);
      await readme.addMarkdown(path.join(markdownPath, 'docker.md'));
    }

    if (answers.useSelectedDependencies.length > 0) {
      await nextra.configureSelectedDependencies({
        ...configureProps,
        selectedDependencies: answers.useSelectedDependencies,
      });
      await readme.addMarkdown(
        path.join(markdownPath, 'selected-dependencies.md')
      );
    }

    if (answers.usePrettier) {
      // clean up === format files - maybe other stuff TBC
      await nextra.cleanUp(configureProps);
    }

    await readme.generate();
  });

program.parse();

export default program;
