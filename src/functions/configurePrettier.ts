import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';
import { InstallNextType } from './installNext.js';

const configurePrettier = async ({
  configsPath,
  nextConfig,
  packageManager,
  root,
}: {
  configsPath: string;
  nextConfig: InstallNextType;
  packageManager: PackageManagerType;
  root: string;
}) => {
  const addPrettierSpinner = ora({
    indent: 2,
    text: 'Configuring Eslint and Prettier',
  }).start();

  try {
    const dependencies = [
      'prettier',
      'eslint-config-prettier',
      '@typescript-eslint/eslint-plugin',
    ];

    if (!nextConfig.eslint) dependencies.push('eslint');

    // if (!useNextStandalone)
    //   // when installing Next with standalone flag there no need to install dependencies as devDependencies in package file
    //   // https://nextjs.org/docs/pages/api-reference/next-config-js/output
    //   dependencies.push(packageManagerSaveDev);

    await packageManager.addToDependencies({
      dependencies,
      isDevDependencies: true,
    });

    const saveConfigs = [
      fs.promises.cp(
        path.join(configsPath, '.eslintrc.json'),
        path.join(root, '.eslintrc.json')
      ),
      fs.promises.cp(
        path.join(configsPath, '.prettierrc.json'),
        path.join(root, '.prettierrc.json')
      ),
      fs.promises.cp(
        path.join(configsPath, '.prettierignore'),
        path.join(root, '.prettierignore')
      ),
    ];

    await Promise.all(saveConfigs);

    await packageManager.addToScripts({
      'lint:check': 'eslint .',
      'lint:fix': 'eslint --fix .',
      'format:check': 'prettier --check .',
      'format:write': 'prettier --write .',
    });

    addPrettierSpinner.succeed();
  } catch (error) {
    addPrettierSpinner.fail();
    oops();
    throw new Error(`\n${error}`);
  }
};

export default configurePrettier;
