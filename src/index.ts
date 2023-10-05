#!/usr/bin/env ts-node
import { program } from 'commander';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

import Configurator from './Configurator.js';
import { packageManagerPrompt, configurationPrompts } from './prompts.js';
import { goodbye } from './utils.js';

console.log('\n', figlet.textSync('Nextra'), '\n\n');

program
  .name('qsbaseline')
  .description(`Generate a baseline Next.js app with best practace feature set`)
  .version(`1.0.0`)
  .usage('<projectName> -- [options]')
  .argument('<projectName>')
  .option('--cypress', 'use cypress')
  .option('--docker', 'use docker')
  .option('--dotEnvFiles', 'create dot env files')
  .option('--eslint', 'use eslint')
  .option('--husky', 'use husky')
  .option('--img-opt', 'use next Image Optimisation (install sharp)')
  .option('--jest', 'use jest')
  .option('--lint-staged', 'use lint-staged')
  .option('--optional-dependencies <type>', 'install optional dependencies')
  .option('--prettier', 'use prettier')
  .option('--react-testing-library', 'use React testing-library')
  .option('--storybook', 'use storybook')
  .option('--use-bun', 'use bun as the package manager')
  .option('--use-npm', 'use npm as the package manager')
  .option('--use-pnpm', 'use pnpm as the package manager')
  .option('--use-yarn', 'use yarn as the package manager')
  .option('-d, --dev', 'run in dev mode')
  .option('--clean', 'clean the tmp dev directory')
  .option('-ts, --typescript', 'use typescript')
  .option('--debug', 'Debug')
  .action(
    async (
      projectName,
      // TODO: add ability to configure via cli options
      options
    ) => {
      let projectDirectoryPath = path.resolve(projectName);

      if (options?.dev) {
        // if the dev flag is passed create a temp directory for the project installation
        // this is for testing as otherwise we would pollute the root dir
        const tempDir = path.resolve('./tmp');
        // clean the tmp directory first
        if (options.clean) {
          await fs.promises.rmdir(tempDir, { recursive: true });
        }
        if (!fs.existsSync(tempDir)) {
          await fs.promises.mkdir(tempDir);
        }
        projectDirectoryPath = path.join(tempDir, projectName);
      }

      const { packageManagerChoice } = await prompts(packageManagerPrompt);

      const configurator = new Configurator({
        projectDirectoryPath,
        packageManagerChoice,
      });

      await configurator.createNextApp();

      const opts = await prompts(configurationPrompts);

      const hasOptions =
        Object.values(opts).includes(true) ||
        opts.optionalDependencies.length > 0 ||
        opts.dotEnvFiles.length > 0;

      if (!hasOptions) {
        // nothing to configure!
        goodbye();
        return console.log(
          `Looks like you've passed on all the configuration options. Maybe next time!`
        );
      }

      configurator.setOptions(opts);

      await configurator.run();
    }
  );

program.parse(process.argv);

const options = program.opts();
if (options.debug) console.log(options);

export default program;
