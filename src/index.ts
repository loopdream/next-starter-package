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

    const {
      useCypress,
      useDocker,
      useHusky,
      useJestRTL,
      useLintStaged,
      useNextStandalone,
      usePrettier,
      useStorybook,
      useSelectedDependencies,
    } = await prompts([
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

    /* NEXT STANDALONE CONFIGURATION  **/

    if (useNextStandalone) {
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

    /* PRETTIER CONFIGURATION  **/

    if (usePrettier) {
      const addPrettierSpinner = ora({
        indent: 2,
        text: 'Configuring Eslint and Prettier',
      }).start();

      try {
        const dependencies = [
          'prettier',
          'eslint-config-prettier',
          '@typescript-eslint/eslint-plugin',
        ];

        if (!nextConfig.eslint) dependencies.push('eslint');

        // if (!useNextStandalone)
        //   // when installing Next with standalone flag there no need to install dependencies as devDependencies in package file
        //   // https://nextjs.org/docs/pages/api-reference/next-config-js/output
        //   dependencies.push(packageManagerSaveDev);

        await packageManager.addToDependencies({
          dependencies,
          isDevDependencies: true,
        });

        const saveConfigs = [
          fs.promises.cp(
            path.join(configsPath, '.eslintrc.json'),
            path.join(root, '.eslintrc.json')
          ),
          fs.promises.cp(
            path.join(configsPath, '.prettierrc.json'),
            path.join(root, '.prettierrc.json')
          ),
          fs.promises.cp(
            path.join(configsPath, '.prettierignore'),
            path.join(root, '.prettierignore')
          ),
        ];

        await Promise.all(saveConfigs);

        await packageManager.addToScripts({
          'lint:check': 'eslint .',
          'lint:fix': 'eslint --fix .',
          'format:check': 'prettier --check .',
          'format:write': 'prettier --write .',
        });

        addPrettierSpinner.succeed();
      } catch (error) {
        addPrettierSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    /* JEST RTL CONFIGURATION  **/

    if (useJestRTL) {
      const addSJestRTLSpinner = ora({
        indent: 2,
        text: 'Configuring Jest and React Testing Library',
      }).start();

      try {
        const dependencies = [
          'jest',
          'jest-environment-jsdom',
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react',
          'cypress',
          'eslint-plugin-testing-library',
        ];

        if (!useNextStandalone) dependencies.push(packageManager.cmds.saveDev);

        await packageManager.addToDependencies({
          dependencies,
          isDevDependencies: true,
        });

        await fs.promises.cp(
          path.join(configsPath, 'jest.config.js'),
          path.join(root, `jest.config.${nextConfig.typescript ? 'ts' : 'js'}`)
        );

        await packageManager.addToScripts({
          test: 'jest --watch',
          'test:ci': 'jest --ci',
        });

        addSJestRTLSpinner.succeed();
      } catch (error) {
        addSJestRTLSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    /* CYPRESS CONFIGURATION  **/

    if (useCypress) {
      const addCypressSpinner = ora({
        indent: 2,
        text: 'Configuring Cypress',
      }).start();
      try {
        await packageManager.addToDependencies({
          dependencies: ['cypress'],
          isDevDependencies: true,
        });

        await fs.promises.cp(
          path.join(configsPath, 'cypress'),
          path.join(root, 'cypress'),
          { recursive: true }
        );

        await packageManager.addToScripts({ e2e: 'cypress run' });

        addCypressSpinner.succeed();
      } catch (error) {
        addCypressSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    /* LINT_STAGED CONFIGURATION  **/

    if (useLintStaged) {
      const addLintStagedSpinner = ora({
        indent: 2,
        text: 'Configuring Lint-staged',
      }).start();

      try {
        // if (!useNextStandalone) deps.push(packageManager.cmds.saveDev);

        await packageManager.addToDependencies({
          dependencies: ['lint-staged'],
          isDevDependencies: true,
        });

        await fs.promises.cp(
          path.join(configsPath, '.lintstagedrc'),
          path.join(root, '.lintstagedrc')
        );

        await packageManager.addToScripts({
          storybook: 'storybook dev -p 6006',
          'build-storybook': 'storybook build',
        });

        addLintStagedSpinner.succeed();
      } catch (error) {
        addLintStagedSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    // /*  GIT & HUSKY CONFIGURATION  **/

    if (useHusky) {
      const addHuskySpinner = ora({
        indent: 2,
        text: 'Configuring Git and Husky',
      }).start();

      try {
        await execa(`git`, [`init`], { cwd: root });

        await execa(
          packageManager.name === 'npm'
            ? 'npx'
            : packageManager.name === 'yarn'
            ? 'yarn'
            : 'pnpm',
          packageManager.name === 'npm'
            ? ['husky-init']
            : packageManager.name === 'yarn'
            ? [`dlx`, `husky-init`, `--yarn2`]
            : [`dlx`, `husky-init`],
          { cwd: root }
        );

        await execa(
          packageManager.name,
          packageManager.name === 'npm' ? ['install'] : [],
          { cwd: root }
        );

        addHuskySpinner.succeed();
      } catch (error) {
        addHuskySpinner.fail();
        throw new Error(`${error}`);
      }
    }

    // /* STORYBOOK CONFIGURATION  **/

    if (useStorybook) {
      const addStorybookSpinner = ora({
        indent: 2,
        text: 'Configuring Storybook',
      }).start();

      try {
        const dependencies = [
          '@storybook/addon-essentials',
          '@storybook/addon-interactions',
          '@storybook/addon-links',
          '@storybook/addon-onboarding',
          '@storybook/blocks',
          '@storybook/nextjs',
          '@storybook/react',
          '@storybook/testing-library',
          'eslint-plugin-storybook',
          'storybook',
        ];

        await packageManager.addToDependencies({
          dependencies,
          isDevDependencies: true,
        });

        await fs.promises.cp(
          path.join(configsPath, '.storybook'),
          path.join(root, '.storybook'),
          {
            recursive: true,
          }
        );

        await packageManager.addToScripts({
          storybook: 'storybook dev -p 6006',
          'build-storybook': 'storybook build',
        });

        addStorybookSpinner.succeed();
      } catch (error) {
        addStorybookSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

    // /* DOCKER CONFIGURATION  **/

    if (useDocker) {
      const addDockerSpinner = ora({
        indent: 2,
        text: 'Configuring Docker',
      }).start();

      try {
        const saveDockerFiles = [
          'docker-compose.yml',
          'Dockerfile',
          'Makefile',
        ].map((file) =>
          fs.promises.cp(path.join(configsPath, file), path.join(root, file))
        );

        await Promise.all(saveDockerFiles);

        addDockerSpinner.succeed();
      } catch (error) {
        addDockerSpinner.fail();
        console.log(oops);
        throw new Error(`\n${error}`);
      }
    }

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
    if (useSelectedDependencies.length > 0) {
      const addSelectedPackagesSpinner = ora({
        indent: 2,
        text: 'Adding selected packages',
      }).start();

      try {
        const dependencies = useSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
          .map(({ module }: { module: string }) => module);

        const devDependencies = useSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
          .map(({ module }: { module: string }) => module);

        await packageManager.addToDependencies({ dependencies });

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
    const addFormatSpinner = ora({
      indent: 2,
      text: 'Cleaning up',
    }).start();

    try {
      if (useSelectedDependencies.length > 0) {
        const dependencies = useSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
          .map(({ module }: { module: string }) => module);

        const devDependencies = useSelectedDependencies
          .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
          .map(({ module }: { module: string }) => module);

        await packageManager.addToDependencies({ dependencies });

        await packageManager.addToDependencies({
          dependencies: devDependencies,
          isDevDependencies: true,
        });
      }

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
  });

program.parse();
