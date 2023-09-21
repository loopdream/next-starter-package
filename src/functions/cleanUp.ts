import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops, PackageManagerType } from '../utils/index.js';

const cleanUp = async ({
  root,
}: {
  root: string;
  packageManager: PackageManagerType;
  configsPath: string;
}) => {
  const addFormatSpinner = ora({
    indent: 2,
    text: 'Cleaning up',
  }).start();
  const { execa } = await import('execa');
  try {
    await execa(`npm`, [`run`, `format:write`], { cwd: root });

    addFormatSpinner.succeed();
  } catch (error) {
    addFormatSpinner.fail();
    console.log(oops);
    throw new Error(`\n${error}`);
  }
};

export default cleanUp;
