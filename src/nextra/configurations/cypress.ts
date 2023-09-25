import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops } from '../../utils.js';
import { PackageManagerType } from '../PackageManager.js';

const configureCypress = async ({
  configsPath,
  packageManager,
  root,
}: {
  configsPath: string;
  packageManager: PackageManagerType;
  root: string;
}) => {
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
    oops();
    throw new Error(`\n${error}`);
  }
};

export default configureCypress;
