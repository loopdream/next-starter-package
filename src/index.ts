#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import ora from 'ora';
import prompts from 'prompts';

import { oops, usePackageManager } from './utils/index.js';

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

import installNext from './functions/installNext.js';
import configurePrettier from './functions/configurePrettier.js';
import configureJestRTL from './functions/configureJestRTL.js';
import configureLintStaged from './functions/configureLintStaged.js';
import configureCypress from './functions/configureCypress.js';
import configureGitHusky from './functions/configureGitHusky.js';
import configureStorybook from './functions/configureStorybook.js';
import configureDocker from './functions/configureDocker.js';

console.log('\n', figlet.textSync('Nextra'), '\n\n');

program
  .name('qsbaseline')
  .description(`Generate a baseline Next.js app with best practace feature set`)
  .version(`1.0.0`)
  .usage('<projectName> -- [options]')
  .argument('<projectName>')
  .option('-d, --dev', 'my test option')
  .action(async (projectName, options) => {
    const { execa } = await import('execa');

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
      useCypressPrompt,
      useHuskyPrompt,
      useDockerPrompt,
      useSelectedDependenciesPrompt,
    ]);

    const configureProps = {
      root,
      packageManager,
      configsPath,
      nextConfig,
    };
    /* NEXT STANDALONE CONFIGURATION  **/

    if (choices.useNextStandalone) {
      const addStandaloneSpinner = ora({
        indent: 2,
        text: 'Configuring next standalone production builds',
      }).start();

      try {
        await fs.promises.cp(
          path.join(configsPath, 'next.config.js'),
          path.join(root, `next.config.js`)
        );
        addStandaloneSpinner.succeed();
      } catch (error) {
        addStandaloneSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    if (choices.usePrettier) await configurePrettier(configureProps);

    if (choices.useJestRTL) await configureJestRTL(configureProps);

    if (choices.useCypress) await configureCypress(configureProps);

    if (choices.useLintStaged) await configureLintStaged(configureProps);

    if (choices.useHusky) await configureGitHusky(configureProps);

    if (choices.useStorybook) await configureStorybook(configureProps);

    if (choices.useDocker) await configureDocker(configureProps);

    const addEnvSpinner = ora({
      indent: 2,
      text: 'Configuring Environment variables',
    }).start();

    try {
      const envFiles = ['.env.example', '.env.local', '.env'].map((file) =>
        fs.promises.cp(
          path.join(configsPath, '.env.example'),
          path.join(root, file)
        )
      );

      await Promise.all(envFiles);

      if (fs.existsSync(path.join(root, '.gitignore'))) {
        await fs.promises.appendFile(
          path.join(root, '.gitignore'),
          `# env files
          .env
          .env.local`
        );
      }

      addEnvSpinner.succeed();
    } catch (error) {
      addEnvSpinner.fail();
      console.log(oops);
      throw new Error(`\n${error}`);
    }

    /* ADDING SELECTED PACKAGES  **/

    if (choices.useSelectedDependencies.length > 0) {
      const addSelectedPackagesSpinner = ora({
        indent: 2,
        text: 'Adding selected packages',
      }).start();

      try {
        const dependencies = choices.useSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
          .map(({ module }: { module: string }) => module);

        const devDependencies = choices.useSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
          .map(({ module }: { module: string }) => module);

        if (dependencies.length > 0)
          await packageManager.addToDependencies({ dependencies });

        if (devDependencies.length > 0)
          await packageManager.addToDependencies({
            dependencies: devDependencies,
            isDevDependencies: true,
          });

        addSelectedPackagesSpinner.succeed();
      } catch (error) {
        addSelectedPackagesSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    /* FORMAT FILES  **/

    if (choices.usePrettier) {
      const addFormatSpinner = ora({
        indent: 2,
        text: 'Cleaning up',
      }).start();

      try {
        await execa(`npm`, [`run`, `format:write`], {
          // stdio: 'inherit',
          cwd: root,
        });

        addFormatSpinner.succeed();
      } catch (error) {
        addFormatSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }
  });

program.parse();
