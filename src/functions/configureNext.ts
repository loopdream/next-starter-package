import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';

const configureNext = async ({
  configsPath,
  packageManager,
  root,
}: {
  configsPath: string;
  packageManager: PackageManagerType;
  root: string;
}) => {
  const addStandaloneSpinner = ora({
    indent: 2,
    text: 'Configuring next standalone production builds',
  }).start();

  try {
    // add standalone next config and build/start scripts
    // https://nextjs.org/docs/pages/api-reference/next-config-js/output

    await fs.promises.cp(
      path.join(configsPath, 'next.config.js'),
      path.join(root, `next.config.js`)
    );

    await packageManager.addToScripts({
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
    });

    addStandaloneSpinner.succeed();
  } catch (error) {
    addStandaloneSpinner.fail();
    console.log(oops);
    throw new Error(`\n${error}`);
  }
};

export default configureNext;
