#!/usr/bin/env ts-node
import { program } from 'commander';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

import Configurator, { OptionsType } from './Configurator.js';
import { PackageManagerKindEnum } from './PackageManager.js';
import { packageManagerPrompt, configurationPrompts } from './prompts.js';
import { goodbye } from './utils.js';

export interface ProgramOptionsType extends OptionsType {
  dev?: boolean;
  clean?: boolean;
  useNpm?: PackageManagerKindEnum.NPM;
  useYarn?: PackageManagerKindEnum.YARN;
  usePnpm?: PackageManagerKindEnum.PNPM;
  useBun?: PackageManagerKindEnum.BUN;
}

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
  .option('--image-optimisation', 'use next Image Optimisation (install sharp)')
  .option('--jest', 'use jest')
  .option('--lint-staged', 'use lint-staged')
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
  .action(async (projectName, options: ProgramOptionsType) => {
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

    const { packageManagerChoice } = options?.useNpm
      ? { packageManagerChoice: PackageManagerKindEnum.NPM }
      : options?.useYarn
      ? { packageManagerChoice: PackageManagerKindEnum.YARN }
      : options?.usePnpm
      ? { packageManagerChoice: PackageManagerKindEnum.PNPM }
      : options?.useBun
      ? { packageManagerChoice: PackageManagerKindEnum.BUN }
      : await prompts(packageManagerPrompt);

    const configurator = new Configurator({
      projectDirectoryPath,
      packageManagerChoice,
    });

    await configurator.createNextApp();

    // strip out the options that have been passed in as cli options
    const filteredConfigurationPrompts = configurationPrompts.filter(
      ({ name }) => !Object.keys(options).includes(name as string)
    );

    const opts = await prompts(filteredConfigurationPrompts);

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

    await configurator.run(opts);
  });

program.parse(process.argv);
