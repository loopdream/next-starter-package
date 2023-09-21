import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';
import { InstallNextType } from './installNext.js';

const configureEnvVars = async ({
  root,
  configsPath,
}: {
  root: string;
  packageManager: PackageManagerType;
  configsPath: string;
  nextConfig: InstallNextType;
}) => {
  const addEnvSpinner = ora({
    indent: 2,
    text: 'Configuring Environment variables',
  }).start();

  try {
    const envFiles = ['.env.example', '.env.local', '.env'].map((file) =>
      fs.promises.cp(
        path.join(configsPath, '.env.example'),
        path.join(root, file)
      )
    );

    await Promise.all(envFiles);

    if (fs.existsSync(path.join(root, '.gitignore'))) {
      await fs.promises.appendFile(
        path.join(root, '.gitignore'),
        `# env files
        .env
        .env.local`
      );
    }

    addEnvSpinner.succeed();
  } catch (error) {
    addEnvSpinner.fail();
    console.log(oops);
    throw new Error(`\n${error}`);
  }
};

export default configureEnvVars;
