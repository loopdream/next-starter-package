import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops } from '../../utils.js';
import { PackageManagerType } from '../PackageManager.js';

const configureLintStaged = async ({
  configsPath,
  packageManager,
  root,
}: {
  configsPath: string;
  packageManager: PackageManagerType;
  root: string;
}) => {
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
    oops();
    throw new Error(`\n${error}`);
  }
};

export default configureLintStaged;
