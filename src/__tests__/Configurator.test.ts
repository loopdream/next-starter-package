import Configurator from '../Configurator.js';
import { PackageManagerKindEnum } from '../PackageManager.js';

describe('Configurator', () => {
  const options = {
    cypress: true,
    docker: true,
    eslint: true,
    husky: true,
    jest: true,
    lintStaged: true,
    imageOptimisation: true,
    optionalDependencies: [
      { module: 'dependency1', saveDev: true },
      { module: 'dependency2', saveDev: false },
    ],
    prettier: true,
    reactTestingLibrary: true,
    storybook: true,
    typescript: true,
  };

  it('should prepare the configuration with all options', async () => {
    const configurator = new Configurator({
      projectDirectoryPath: './',
      packageManagerChoice: PackageManagerKindEnum.NPM,
    });
    const config = await configurator
      .setOptions(options)
      .then(() => configurator.prepare())
      .then(() => configurator.getConfig());

    expect(config.configTemplateFiles).toEqual([
      'next.config.js',
      '.editorconfig',
      'docker-compose.yml',
      'Dockerfile',
      'Makefile',
      'jest.config.js',
      'jest.setup.js',
    ]);

    expect(config.configTemplateDirectories).toEqual(['cypress', '.storybook']);

    expect(config.packageScripts).toEqual({
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone':
        'cp -R ./public ./.next/standalone && cp -R ./.next/static ./public ./.next/standalone/.next && node ./.next/standalone/server.js',
      'build-start': 'next build && next start',
      'build-start:standalone':
        'npm run build:standalone && npm run start:standalone',
      'format:check': 'prettier --check .',
      'format:write': 'prettier --write .',
      prepare: 'husky install',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
      'test:ci': 'jest --ci --coverage',
      e2e: 'cypress run',
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build',
    });

    expect(config.packageDependencies).toEqual(['sharp', 'dependency2']);

    expect(config.packageDevDependencies).toEqual([
      'cypress',
      'husky',
      '@typescript-eslint/eslint-plugin',
      'lint-staged',
      'prettier',
      'eslint-config-prettier',
      '@trivago/prettier-plugin-sort-imports',
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
      'jest',
      'jest-environment-jsdom',
      '@types/jest',
      'ts-jest',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      '@testing-library/react',
      'eslint-plugin-testing-library',
      'dependency1',
    ]);

    expect(config.markdown).toEqual([
      'next.md',
      'cypress.md',
      'docker.md',
      'prettier.md',
      'storybook.md',
      'jest.md',
      'reactTestingLibrary.md',
      'lint-staged.md',
      'git.md',
      'husky.md',
      'selected-dependencies.md',
    ]);
  });

  it('should prepare the configuration with only some options set to true', async () => {
    const configurator = new Configurator({
      projectDirectoryPath: './',
      packageManagerChoice: PackageManagerKindEnum.NPM,
    });

    const config = await configurator
      .setOptions({
        ...options,
        cypress: false,
        husky: false,
        jest: false,
        reactTestingLibrary: false,
        imageOptimisation: false,
        optionalDependencies: [],
        storybook: false,
        typescript: false,
      })
      .then(() => configurator.prepare())
      .then(() => configurator.getConfig());

    expect(config.configTemplateFiles).toEqual([
      'next.config.js',
      '.editorconfig',
      'docker-compose.yml',
      'Dockerfile',
      'Makefile',
    ]);

    expect(config.configTemplateDirectories).toEqual([]);

    expect(config.packageScripts).toEqual({
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone':
        'cp -R ./public ./.next/standalone && cp -R ./.next/static ./public ./.next/standalone/.next && node ./.next/standalone/server.js',
      'build-start': 'next build && next start',
      'build-start:standalone':
        'npm run build:standalone && npm run start:standalone',
      'format:check': 'prettier --check .',
      'format:write': 'prettier --write .',
    });

    expect(config.packageDependencies).toEqual([]);

    expect(config.packageDevDependencies).toEqual([
      'lint-staged',
      'prettier',
      'eslint-config-prettier',
      '@trivago/prettier-plugin-sort-imports',
    ]);

    expect(config.markdown).toEqual([
      'next.md',
      'docker.md',
      'prettier.md',
      'lint-staged.md',
    ]);
  });

  // await configurator.prepare();

  it('should prepare the configuration with no options', async () => {
    const configurator = new Configurator({
      projectDirectoryPath: './',
      packageManagerChoice: PackageManagerKindEnum.NPM,
    });

    const config = await configurator
      .prepare()
      .then(() => configurator.getConfig());

    expect(config.configTemplateFiles).toEqual([
      'next.config.js',
      '.editorconfig',
    ]);

    expect(config.configTemplateDirectories).toEqual([]);

    expect(config.packageScripts).toEqual({
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone':
        'cp -R ./public ./.next/standalone && cp -R ./.next/static ./public ./.next/standalone/.next && node ./.next/standalone/server.js',
      'build-start': 'next build && next start',
      'build-start:standalone':
        'npm run build:standalone && npm run start:standalone',
    });

    expect(config.packageDependencies).toEqual([]);

    expect(config.packageDevDependencies).toEqual([]);

    expect(config.markdown).toEqual(['next.md']);
  });
});
