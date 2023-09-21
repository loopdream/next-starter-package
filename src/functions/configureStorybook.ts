import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';

const configureStorybook = async ({
  root,
  packageManager,
  configsPath,
}: {
  root: string;
  packageManager: PackageManagerType;
  configsPath: string;
}) => {
  const addStorybookSpinner = ora({
    indent: 2,
    text: 'Configuring Storybook',
  }).start();

  try {
    const dependencies = [
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

    await packageManager.addToDependencies({
      dependencies,
      isDevDependencies: true,
    });

    await fs.promises.cp(
      path.join(configsPath, '.storybook'),
      path.join(root, '.storybook'),
      {
        recursive: true,
      }
    );

    await packageManager.addToScripts({
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build',
    });

    addStorybookSpinner.succeed();
  } catch (error) {
    addStorybookSpinner.fail();
    console.log(oops);
    throw new Error(`\n${error}`);
  }
};

export default configureStorybook;
