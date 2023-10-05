import makeLintStagedConfig from './makeLintStagedConfig.js';

describe('makeLintStagedConfig', () => {
  it('should return a valid lint-staged configuration object', () => {
    //test
    const expectedConfig = {
      '**/*.js?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'jest --ci',
      ],
      '**/*.ts?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'jest --ci',
        'tsc --noEmit',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStagedConfig({
      eslint: true,
      jest: true,
      prettier: true,
      typescript: true,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without TypeScript', () => {
    const expectedConfig = {
      '**/*.js?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'jest --ci',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStagedConfig({
      eslint: true,
      jest: true,
      prettier: true,
      typescript: false,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without Jest', () => {
    const expectedConfig = {
      '**/*.js?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
      ],
      '**/*.ts?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'tsc --noEmit',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStagedConfig({
      eslint: true,
      jest: false,
      prettier: true,
      typescript: true,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without Prettier', () => {
    const expectedConfig = {
      '**/*.js?(x)': ['eslint .', 'eslint --fix .', 'jest --ci'],
      '**/*.ts?(x)': [
        'eslint .',
        'eslint --fix .',
        'jest --ci',
        'tsc --noEmit',
      ],
    };

    const config = makeLintStagedConfig({
      eslint: true,
      jest: true,
      prettier: false,
      typescript: true,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without ESLint', () => {
    const options = {
      eslint: false,
      jest: true,
      prettier: true,
      typescript: true,
    };
    const expectedConfig = {
      '**/*.js?(x)': ['prettier --check .', 'prettier --write .', 'jest --ci'],
      '**/*.ts?(x)': [
        'prettier --check .',
        'prettier --write .',
        'jest --ci',
        'tsc --noEmit',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'], // TODO: add styledlint
    };

    const config = makeLintStagedConfig(options);

    expect(config).toEqual(expectedConfig);
  });
});
