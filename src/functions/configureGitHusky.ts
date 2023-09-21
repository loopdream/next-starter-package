import ora from 'ora';

import { PackageManagerType } from '../utils/index.js';

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

    await execa(
      packageManager.name === 'npm'
        ? 'npx'
        : packageManager.name === 'yarn'
        ? 'yarn'
        : 'pnpm',
      packageManager.name === 'npm'
        ? ['husky-init']
        : packageManager.name === 'yarn'
        ? [`dlx`, `husky-init`, `--yarn2`]
        : [`dlx`, `husky-init`],
      { cwd: root }
    );

    await execa(
      packageManager.name,
      packageManager.name === 'npm' ? ['install'] : [],
      { cwd: root }
    );

    addHuskySpinner.succeed();
  } catch (error) {
    addHuskySpinner.fail();
    throw new Error(`${error}`);
  }
};

export default configureGitHusky;
