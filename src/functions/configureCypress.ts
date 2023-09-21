import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';

const configureCypress = async ({
  root,
  packageManager,
  configsPath,
}: {
  root: string;
  packageManager: PackageManagerType;
  configsPath: string;
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
    console.log(oops);
    throw new Error(`\n${error}`);
  }
};

export default configureCypress;
