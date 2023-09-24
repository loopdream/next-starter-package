import ora from 'ora';

import { oops } from '../../utils/index.js';
import { PackageManagerType } from '../usePackageManager.js';

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
    await $({ cwd: root })`${packageManager.getKind()} run format:write`;

    addFormatSpinner.succeed();
  } catch (error) {
    addFormatSpinner.fail();
    oops();
    throw new Error(`\n${error}`);
  }
};

export default cleanUp;
