import ora from 'ora';

import { PackageManagerType, PackageManagerKind } from '../utils/index.js';

const configureGitHusky = async ({
  packageManager,
  root,
}: {
  packageManager: PackageManagerType;
  root: string;
}) => {
  const { $ } = await import('execa');
  const execa = $({ cwd: root });

  const addHuskySpinner = ora({
    indent: 2,
    text: 'Configuring Git and Husky',
  }).start();

  try {
    await execa`git init`;

    if (packageManager.kind === PackageManagerKind.YARN) {
      await execa`yarn dlx husky-init --yarn2 && yarn`;
    }

    if (packageManager.kind === PackageManagerKind.PNPM) {
      await execa`pnpm dlx husky-init && pnpm install`;
    }

    if (packageManager.kind === PackageManagerKind.NPM) {
      await execa`npx husky-init && npm install`;
    }

    addHuskySpinner.succeed();
  } catch (error) {
    addHuskySpinner.fail();
    throw new Error(`${error}`);
  }
};

export default configureGitHusky;
