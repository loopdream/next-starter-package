import ora from 'ora';
import prompts from 'prompts';

import { oops } from '../utils.js';
import { PackageManagerType } from '../PackageManager.js';

const configureSelectedPackages = async ({
  packageManager,
  selectedDependencies,
}: {
  packageManager: PackageManagerType;
  selectedDependencies: prompts.Answers<string>;
}) => {
  const addSelectedPackagesSpinner = ora({
    indent: 2,
    text: 'Adding selected packages',
  }).start();

  try {
    const dependencies = selectedDependencies
      .filter(({ saveDev }: { saveDev: boolean }) => !saveDev)
      .map(({ module }: { module: string }) => module);

    const devDependencies = selectedDependencies
      .filter(({ saveDev }: { saveDev: boolean }) => saveDev)
      .map(({ module }: { module: string }) => module);

    if (dependencies.length > 0)
      await packageManager.addToDependencies({ dependencies });

    if (devDependencies.length > 0)
      await packageManager.addToDependencies({
        dependencies: devDependencies,
        devDependencies: true,
      });

    addSelectedPackagesSpinner.succeed();
  } catch (error) {
    addSelectedPackagesSpinner.fail();
    oops();
    throw new Error(`\n${error}`);
  }
};

export default configureSelectedPackages;
