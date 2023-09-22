import ora from 'ora';

import { PackageManagerType, PackageManagerKind } from '../utils/index.js';

const configureGitHusky = async ({
  packageManager,
  root,
}: {
  packageManager: PackageManagerType;
  root: string;
}) => {
  const { execa } = await import('execa');

  const addHuskySpinner = ora({
    indent: 2,
    text: 'Configuring Git and Husky',
  }).start();

  try {
    await execa(`git`, [`init`], { cwd: root });

    if (packageManager.kind === PackageManagerKind.YARN) {
      await execa(`yarn`, [`dlx`, `husky-init`, `--yarn2`], { cwd: root });
      await execa(`yarn`, [], { cwd: root });
    }

    if (packageManager.kind === PackageManagerKind.PNPM) {
      await execa(`pnpm`, [`dlx`, `husky-init`], { cwd: root });
      await execa(`pnpm`, [`install`], { cwd: root });
    }

    if (packageManager.kind === PackageManagerKind.NPM) {
      await execa(`npx`, [`husky-init`], { cwd: root });
      await execa(`npm`, [`install`], { cwd: root });
    }

    addHuskySpinner.succeed();
  } catch (error) {
    addHuskySpinner.fail();
    throw new Error(`${error}`);
  }
};

export default configureGitHusky;
