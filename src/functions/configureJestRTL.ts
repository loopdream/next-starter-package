import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';
import { InstallNextType } from './installNext.js';

const configureJestRTL = async ({
  root,
  packageManager,
  configsPath,
  nextConfig,
}: {
  root: string;
  packageManager: PackageManagerType;
  configsPath: string;
  nextConfig: InstallNextType;
}) => {
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

    // if (!useNextStandalone) dependencies.push(packageManager.cmds.saveDev);

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
};

export default configureJestRTL;
