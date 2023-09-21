import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';

const configureNextConfigFile = async ({
  root,
  configsPath,
}: {
  root: string;
  packageManager: PackageManagerType;
  configsPath: string;
}) => {
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
};

export default configureNextConfigFile;
