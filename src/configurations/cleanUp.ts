import ora from 'ora';

import { oops } from '../utils.js';
import { PackageManagerKindEnum } from '../PackageManager.js';

const cleanUp = async ({
  root,
  packageManagerKind,
}: {
  root: string;
  packageManagerKind: PackageManagerKindEnum;
}) => {
  const addFormatSpinner = ora({
    indent: 2,
    text: 'Cleaning up',
  }).start();
  const { $ } = await import('execa');

  try {
    await $({ cwd: root })`${packageManagerKind} run format:write`;

    addFormatSpinner.succeed();
  } catch (error) {
    addFormatSpinner.fail();
    oops();
    throw new Error(`\n${error}`);
  }
};

export default cleanUp;
