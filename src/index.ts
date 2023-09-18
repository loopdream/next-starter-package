#!/usr/bin/env ts-node
import path from 'path';
import fs from 'fs';

import { program } from 'commander';
import figlet from 'figlet';
import ora from 'ora';

import { addToPackageScripts, goodbye } from './functions.js';

import { MESSAGES } from './messages.js';

import {
  installDashboardPrompt,
  configurationPrompts,
  useYarnPrompt,
} from './prompts.js';

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

    const oops = `\n${figlet.textSync('Ooops...')}\n\n`;

    let projectDirectoryPath = projectName;

    if (options?.dev) {
      // if the dev flag is passed create a temp directory for the project installation
      // this is for testing as otherwise we would pollute the root dir
      if (!fs.existsSync('./tmp')) await fs.promises.mkdir('./tmp');
      projectDirectoryPath = path.join('tmp', projectName);
    }

    const root = path.resolve(projectDirectoryPath);
    const configsPath = path.resolve(path.join('src', 'configs'));

    const { installDashboard } = await installDashboardPrompt(projectName);

    if (!installDashboard) return goodbye();

    const { useYarn } = await useYarnPrompt();
    const pkgMgr = useYarn ? 'yarn' : 'npm';
    const pkgMgrCmd = useYarn ? 'add' : 'install';
    const pkgMgrDevDeps = useYarn ? '--dev' : '--save-dev';

    /* INSTALL NEXT **/

    try {
      console.log(`\n`);

      await execa(`npx`, [`create-next-app@latest`, root, `--use-${pkgMgr}`], {
        stdio: 'inherit',
      });
    } catch (error) {
      console.log(oops);
      throw new Error(`\n${MESSAGES.nextJs.error} ${error}`);
    }

    const artifactExists = (fileName: string) => {
      try {
        return fs.existsSync(path.join(root, fileName));
      } catch (e) {
        console.log({ e });
      }
    };
    const typescript = artifactExists('tsconfig.json');
    const nextConfig = {
      appRouter: !artifactExists('src/pages'),
      eslint: artifactExists('.eslintrc.json'),
      tailwind: artifactExists(`tailwind.config.${typescript ? 'ts' : 'js'}`),
      srcDir: artifactExists('src'),
      typescript,
    };

    const {
      useCypress,
      useDocker,
      useHusky,
      useJestRTL,
      useLintStaged,
      useNextStandalone,
      usePrettier,
      useStorybook,
    } = await configurationPrompts();

    /* PRETTIER CONFIGURATION  **/

    if (usePrettier) {
      const addPrettierSpinner = ora({
        indent: 2,
        text: 'Configuring Eslint and Prettier',
      }).start();

      try {
        const deps = [
          'prettier',
          'eslint-config-prettier',
          '@typescript-eslint/eslint-plugin',
        ];

        if (!useNextStandalone)
          // when installing Next with standalone flag there no need to install dependencies as devDependencies in package file
          // https://nextjs.org/docs/pages/api-reference/next-config-js/output
          deps.push(pkgMgrDevDeps);

        await execa(pkgMgr, [pkgMgrCmd, ...deps], {
          // stdio: 'inherit',
          cwd: root,
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

        addToPackageScripts({
          scripts: {
            'lint:check': 'eslint .',
            'lint:fix': 'eslint --fix .',
            'format:check': 'prettier --check .',
            'format:write': 'prettier --write .',
          },
          root,
        });

        addPrettierSpinner.succeed();
      } catch (error) {
        addPrettierSpinner.fail();
        throw new Error(`${error}`);
      }
    }

    /* JEST RTL CONFIGURATION  **/

    if (useJestRTL) {
      const addSJestRTLSpinner = ora({
        indent: 2,
        text: 'Configuring Jest and React Testing Library',
      }).start();

      try {
        const deps = [
          'jest',
          'jest-environment-jsdom',
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react',
          'cypress',
          'eslint-plugin-testing-library',
        ];

        if (!useNextStandalone) deps.push(pkgMgrDevDeps);

        await execa(pkgMgr, [pkgMgrCmd, ...deps], {
          // stdio: 'inherit',
          cwd: root,
        });

        await fs.promises.cp(
          path.join(configsPath, 'jest.config.js'),
          path.join(root, `jest.config.${nextConfig.typescript ? 'ts' : 'js'}`)
        );

        addToPackageScripts({
          scripts: {
            test: 'jest --watch',
            'test:ci': 'jest --ci',
          },
          root,
        });

        addSJestRTLSpinner.succeed();
      } catch (error) {
        addSJestRTLSpinner.fail();
        throw new Error(`${error}`);
      }
    }

    /* CYPRESS CONFIGURATION  **/

    if (useCypress) {
      const addCypressSpinner = ora({
        indent: 2,
        text: 'Configuring Cypress',
      }).start();
      try {
        await execa(pkgMgr, [pkgMgrCmd, pkgMgrDevDeps, 'cypress'], {
          // stdio: 'inherit',
          cwd: root,
        });

        await fs.promises.cp(
          path.join(configsPath, 'cypress'),
          path.join(root, 'cypress'),
          {
            recursive: true,
          }
        );

        addToPackageScripts({
          scripts: {
            e2e: 'cypress run',
          },
          root,
        });

        addCypressSpinner.succeed();
      } catch (error) {
        addCypressSpinner.fail();
        throw new Error(`${error}`);
      }
    }

    /* LINT_STAGED CONFIGURATION  **/

    if (useLintStaged) {
      const addLintStagedSpinner = ora({
        indent: 2,
        text: 'Configuring Lint-staged',
      }).start();

      try {
        const deps = ['lint-staged'];

        if (!useNextStandalone) deps.push(pkgMgrDevDeps);

        await execa(pkgMgr, [pkgMgrCmd, ...deps], {
          // stdio: 'inherit',
          cwd: root,
        });

        await fs.promises.cp(
          path.join(configsPath, '.lintstagedrc'),
          path.join(root, '.lintstagedrc')
        );

        addToPackageScripts({
          scripts: {
            storybook: 'storybook dev -p 6006',
            'build-storybook': 'storybook build',
          },
          root,
        });

        addLintStagedSpinner.succeed();
      } catch (error) {
        addLintStagedSpinner.fail();
        throw new Error(`${error}`);
      }
    }

    /*  GIT & HUSKY CONFIGURATION  **/

    if (useHusky) {
      const addHuskySpinner = ora({
        indent: 2,
        text: 'Configuring Git and Husky',
      }).start();

      try {
        await execa(`git`, [`init`], {
          // stdio: 'inherit',
          cwd: root,
        });

        await execa(
          useYarn ? 'yarn' : 'npx',
          useYarn ? [`dlx`, `husky-init`, `--yarn2`] : ['husky-init'],
          {
            // stdio: 'inherit',
            cwd: root,
          }
        );

        await execa(useYarn ? 'yarn' : 'npm', useYarn ? [] : ['install'], {
          // stdio: 'inherit',
          cwd: root,
        });

        addHuskySpinner.succeed();
      } catch (error) {
        addHuskySpinner.fail();
        throw new Error(`${MESSAGES.esLintPrettier.error} ${error}`);
      }
    }

    /* STORYBOOK CONFIGURATION  **/

    if (useStorybook) {
      const addStorybookSpinner = ora({
        indent: 2,
        text: 'Configuring Storybook',
      }).start();

      try {
        const deps = [
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

        if (!useNextStandalone) deps.push(pkgMgrDevDeps);

        await execa(pkgMgr, [pkgMgrCmd, ...deps], {
          // stdio: 'inherit',
          cwd: root,
        });

        await fs.promises.cp(
          path.join(configsPath, '.storybook'),
          path.join(root, '.storybook'),
          {
            recursive: true,
          }
        );

        addToPackageScripts({
          scripts: {
            storybook: 'storybook dev -p 6006',
            'build-storybook': 'storybook build',
          },
          root,
        });

        addStorybookSpinner.succeed();
      } catch (error) {
        addStorybookSpinner.fail();
        throw new Error(`${error}`);
      }
    }

    /* DOCKER CONFIGURATION  **/

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
        throw new Error(`${error}`);
      }
    }

    /* FORMAT FILES  **/
    const addFormatSpinner = ora({
      indent: 2,
      text: 'Formatting files with prettier',
    }).start();

    try {
      await execa(`npm`, [`run`, `format:write`], {
        // stdio: 'inherit',
        cwd: root,
      });
      addFormatSpinner.succeed();
    } catch (error) {
      addFormatSpinner.fail();
      throw new Error(`${error}`);
    }
  });

program.parse();
