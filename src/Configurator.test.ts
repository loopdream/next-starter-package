import Configurator from './Configurator.js';
import { PackageManagerKindEnum } from './PackageManager.js';

describe('Configurator', () => {
  it('should prepare the configuration with all options', async () => {
    const configurator = new Configurator({
      projectDirectoryPath: './',
      packageManagerChoice: PackageManagerKindEnum.NPM,
    });

    configurator.setOptions({
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
    });

    await configurator.prepare();

    const config = configurator.getConfig();

    expect(config.configTemplateFiles).toEqual([
      'next.config.js',
      'docker-compose.yml',
      'Dockerfile',
      'Makefile',
      '.prettierrc.json',
      '.prettierignore',
      'jest.config.js',
      'jest.setup.js',
    ]);

    expect(config.configTemplateDirectories).toEqual(['cypress', '.storybook']);

    expect(config.packageScripts).toEqual({
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
      'build-start': 'next build && next start',
      'build-start:standalone':
        'npm run build:standalone && npm run start:standalone',
      'format:check': 'prettier --check .',
      'format:write': 'prettier --write .',
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

  it('should prepare the configuration with no options', async () => {
    const configurator = new Configurator({
      projectDirectoryPath: './',
      packageManagerChoice: PackageManagerKindEnum.NPM,
    });

    const config = await configurator.prepare();

    expect(config.configTemplateFiles).toEqual(['next.config.js']);

    expect(config.configTemplateDirectories).toEqual([]);

    expect(config.packageScripts).toEqual({
      'build:standalone': 'BUILD_STANDALONE=true next build',
      'start:standalone': 'node ./.next/standalone/server.js',
      'build-start': 'next build && next start',
      'build-start:standalone':
        'npm run build:standalone && npm run start:standalone',
    });

    expect(config.packageDependencies).toEqual([]);

    expect(config.packageDevDependencies).toEqual([]);

    expect(config.markdown).toEqual(['next.md']);
  });
});
