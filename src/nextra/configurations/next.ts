import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops } from '../../utils/index.js';
import { PackageManagerType } from '../usePackageManager.js';

const configureNext = async ({
  configsPath,
  packageManager,
  root,
  useNextImageOptimisation,
}: {
  configsPath: string;
  packageManager: PackageManagerType;
  root: string;
  useNextImageOptimisation: boolean;
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

    if (useNextImageOptimisation) {
      // https://nextjs.org/docs/app/building-your-application/optimizing/images
      await packageManager.addToDependencies({
        dependencies: ['sharp'],
      });
    }

    addStandaloneSpinner.succeed();
  } catch (error) {
    addStandaloneSpinner.fail();
    oops();
    throw new Error(`\n${error}`);
  }
};

export default configureNext;
