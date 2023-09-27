import ora from 'ora';

import { PackageManagerKindEnum } from '../PackageManager.js';

const configureGitHusky = async ({
  packageManagerKind,
  root,
}: {
  packageManagerKind: PackageManagerKindEnum;
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

    if (packageManagerKind === PackageManagerKindEnum.YARN) {
      await execa`yarn dlx husky-init --yarn2 && yarn`;
    }

    if (packageManagerKind === PackageManagerKindEnum.PNPM) {
      await execa`pnpm dlx husky-init && pnpm install`;
    }

    if (packageManagerKind === PackageManagerKindEnum.NPM) {
      await execa`npx husky-init && npm install`;
    }

    if (packageManagerKind === PackageManagerKindEnum.BUN) {
      await execa`bunx husky-init && bun install`;
    }

    addHuskySpinner.succeed();
  } catch (error) {
    addHuskySpinner.fail();
    throw new Error(`${error}`);
  }
};

export default configureGitHusky;
