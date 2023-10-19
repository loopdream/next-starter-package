import { OptionsType } from '../Configurator.js';
import { PackageManagerKindEnum } from '../PackageManager.js';

type PrepareConfigType = Pick<
  OptionsType,
  | 'eslint'
  | 'jest'
  | 'prettier'
  | 'typescript'
  | 'lintStaged'
  | 'storybook'
  | 'reactTestingLibrary'
  | 'cypress'
  | 'husky'
  | 'imageOptimisation'
  | 'optionalDependencies'
  | 'docker'
  | 'packageManager'
>;

function prepareConfig({
  eslint,
  jest,
  prettier,
  typescript,
  lintStaged,
  storybook,
  reactTestingLibrary,
  cypress,
  husky,
  imageOptimisation,
  optionalDependencies,
  docker,
  packageManager: pm,
}: PrepareConfigType) {
  const packageDependencies = [...(imageOptimisation ? ['sharp'] : [])];

  const packageDevDependencies = [
    ...(cypress ? ['cypress'] : []),
    ...(husky ? ['husky'] : []),
    ...(eslint && typescript ? ['@typescript-eslint/eslint-plugin'] : []),
    ...(lintStaged ? ['lint-staged'] : []),
    ...(prettier
      ? [
          'prettier',
          'eslint-config-prettier',
          '@trivago/prettier-plugin-sort-imports',
        ]
      : []),
    ...(storybook
      ? [
          '@storybook/addon-essentials',
          '@storybook/addon-interactions',
          '@storybook/addon-links',
          '@storybook/addon-onboarding',
          '@storybook/blocks',
          '@storybook/nextjs',
          '@storybook/react',
          '@storybook/testing-library',
          'eslint-plugin-storybook',
          'storybook',
        ]
      : []),
    ...(jest
      ? [
          'jest',
          'jest-environment-jsdom',
          ...(typescript ? ['@types/jest', 'ts-jest'] : []),
        ]
      : []),
    ...(reactTestingLibrary
      ? [
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react',
          'eslint-plugin-testing-library',
        ]
      : []),
  ];

  if (optionalDependencies?.length > 0) {
    packageDependencies.push(
      ...optionalDependencies
        .filter(({ saveDev }) => !saveDev)
        .map(({ module }) => module)
    );

    packageDevDependencies.push(
      ...optionalDependencies
        .filter(({ saveDev }) => saveDev)
        .map(({ module }) => module)
    );
  }

  const markdown = [
    'next.md',
    ...(cypress ? ['cypress.md'] : []),
    ...(docker ? ['docker.md'] : []),
    ...(prettier ? ['prettier.md'] : []),
    ...(storybook ? ['storybook.md'] : []),
    ...(jest ? ['jest.md'] : []),
    ...(reactTestingLibrary ? ['reactTestingLibrary.md'] : []),
    ...(lintStaged ? ['lint-staged.md'] : []),
    ...(husky ? ['git.md', 'husky.md'] : []),
    ...(optionalDependencies.length > 0 ? ['selected-dependencies.md'] : []),
  ];

  const packageScripts = {
    'build:standalone': 'BUILD_STANDALONE=true next build',
    'start:standalone':
      'cp -R ./public ./.next/standalone && cp -R ./.next/static ./public ./.next/standalone/.next && node ./.next/standalone/server.js',
    'build-start': `next build && next start`,
    'build-start:standalone': `${pm} run build:standalone && ${pm} run start:standalone`,
    ...(prettier
      ? {
          'format:check': 'prettier --check .',
          'format:write': 'prettier --write .',
        }
      : {}),
    ...(jest
      ? {
          test: 'jest',
          'test:watch': 'jest --watch',
          'test:coverage': 'jest --coverage',
          'test:ci': 'jest --ci --coverage',
        }
      : {}),
    ...(cypress ? { e2e: 'cypress run' } : {}),
    ...(storybook
      ? {
          storybook: 'storybook dev -p 6006',
          'build-storybook': 'storybook build',
        }
      : {}),
    ...(husky
      ? {
          [pm === PackageManagerKindEnum.YARN ? 'postinstall' : 'prepare']:
            'husky install',
        }
      : {}),
  };

  const configTemplateFiles = [
    'next.config.js',
    '.editorconfig',
    ...(docker ? ['docker-compose.yml', 'Dockerfile', 'Makefile'] : []),
    ...(jest ? ['jest.config.js', 'jest.setup.js'] : []),
  ];

  const configTemplateDirectories = [
    ...(cypress ? ['cypress'] : []),
    ...(storybook ? ['.storybook'] : []),
  ];

  return {
    configTemplateDirectories,
    configTemplateFiles,
    markdown,
    packageDependencies,
    packageDevDependencies,
    packageScripts,
  };
}

export default prepareConfig;
