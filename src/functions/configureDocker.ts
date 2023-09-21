import path from 'path';
import fs from 'fs';
import ora from 'ora';

import { oops } from '../utils/index.js';

const configureDocker = async ({
  root,
  configsPath,
}: {
  root: string;
  configsPath: string;
}) => {
  const addDockerSpinner = ora({
    indent: 2,
    text: 'Configuring Docker',
  }).start();

  try {
    const saveDockerFiles = [
      'docker-compose.yml',
      'Dockerfile',
      'Makefile',
    ].map((file) =>
      fs.promises.cp(path.join(configsPath, file), path.join(root, file))
    );

    await Promise.all(saveDockerFiles);

    addDockerSpinner.succeed();
  } catch (error) {
    addDockerSpinner.fail();
    console.log(oops);
    throw new Error(`\n${error}`);
  }
};

export default configureDocker;
