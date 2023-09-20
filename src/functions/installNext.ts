import path from 'path';
import fs from 'fs';

import { oops, PackageManagerType } from '../utils/index.js';

const installNext = async ({
  root,
  packageManager,
}: {
  root: string;
  packageManager: PackageManagerType;
}) => {
  try {
    console.log(`\n`);
    const { execa } = await import('execa');

    await execa(
      `npx`,
      [`create-next-app@latest`, root, `--use-${packageManager.name}`],
      {
        stdio: 'inherit',
      }
    );
  } catch (error) {
    console.log(oops);
    throw new Error(`\n${error}`);
  }

  const artifactExists = (fileName: string) => {
    try {
      return fs.existsSync(path.join(root, fileName));
    } catch (e) {
      console.log({ e });
    }
  };

  const typescript = artifactExists('tsconfig.json');
  const nextConfig = {
    appRouter: !artifactExists('src/pages'),
    eslint: artifactExists('.eslintrc.json'),
    tailwind: artifactExists(`tailwind.config.${typescript ? 'ts' : 'js'}`),
    srcDir: artifactExists('src'),
    typescript,
  };

  return nextConfig;
};

export default installNext;
