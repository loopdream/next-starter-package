import ora from 'ora';

import {
  PackageManagerType,
  PackageManagerKindEnum,
} from '../PackageManager.js';

const configureGitHusky = async ({
  packageManager,
  root,
}: {
  packageManager: PackageManagerType;
  root: string;
}) => {
  const { $ } = await import('execa');

  const addHuskySpinner = ora({
    indent: 2,
    text: 'Configuring Git and Husky',
  }).start();

  try {
    const execa = $({ cwd: root });
    await execa`git init`;

    if (packageManager.getKind() === PackageManagerKindEnum.YARN) {
      await execa`yarn dlx husky-init --yarn2 && yarn`;
    }

    if (packageManager.getKind() === PackageManagerKindEnum.PNPM) {
      await execa`pnpm dlx husky-init && pnpm install`;
    }

    if (packageManager.getKind() === PackageManagerKindEnum.NPM) {
      await execa`npx husky-init && npm install`;
    }

    addHuskySpinner.succeed();
  } catch (error) {
    addHuskySpinner.fail();
    throw new Error(`${error}`);
  }
};

export default configureGitHusky;
