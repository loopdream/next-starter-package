import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';

const cleanUp = async ({
  root,
  packageManager,
}: {
  root: string;
  packageManager: PackageManagerType;
}) => {
  const addFormatSpinner = ora({
    indent: 2,
    text: 'Cleaning up',
  }).start();
  const { $ } = await import('execa');

  try {
    await $({ cwd: root })`${packageManager.kind} run format:write`;

    addFormatSpinner.succeed();
  } catch (error) {
    addFormatSpinner.fail();
    oops();
    throw new Error(`\n${error}`);
  }
};

export default cleanUp;
