import path from 'path';
import fs from 'fs';

import { oops } from '../../utils.js';
import { PackageManagerKindEnum } from '../PackageManager.js';

export interface NextConfigType {
  appRouter: boolean;
  eslint: boolean;
  srcDir: boolean;
  tailwind: boolean;
  typescript: boolean;
}

const createNextApp = async ({
  packageManagerKind,
  root,
}: {
  packageManagerKind: PackageManagerKindEnum;
  root: string;
}) => {
  try {
    console.log(`\n`);

    const { $ } = await import('execa');
    const execa = $({ stdio: 'inherit' });

    await execa`npx create-next-app@latest ${root} --use-${packageManagerKind}`;
  } catch (error) {
    oops();
    throw new Error(`\n${error}`);
  }

  const artifactExists = (fileName: string) => {
    try {
      return fs.existsSync(path.join(root, fileName));
    } catch (e) {
      console.log({ e });
    }
  };

  const typescript = artifactExists('tsconfig.json') || false;
  const nextConfig: NextConfigType = {
    appRouter: !artifactExists('src/pages') || false,
    eslint: artifactExists('.eslintrc.json') || false,
    tailwind:
      artifactExists(`tailwind.config.${typescript ? 'ts' : 'js'}`) || false,
    srcDir: artifactExists('src') || false,
    typescript,
  };

  return nextConfig;
};

export default createNextApp;
