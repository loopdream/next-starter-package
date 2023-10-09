import makeLintStagedrc from '../makeLintStagedrc.js';

describe('makeLintStagedrc', () => {
  describe('When eslint, jest, prettier and typescript options are true', () => {
    it('should return a valid lint-staged configuration object', () => {
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

      const config = makeLintStagedrc({
        eslint: true,
        jest: true,
        prettier: true,
        typescript: true,
      });

      expect(config).toEqual(expectedConfig);
    });
  });

  describe('When typescript is false and all other options are true', () => {
    it('should return a valid lint-staged configuration object without typescript', () => {
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

      const config = makeLintStagedrc({
        eslint: true,
        jest: true,
        prettier: true,
        typescript: false,
      });

      expect(config).toEqual(expectedConfig);
    });
  });
  describe('When jest is false and all other options are true', () => {
    it('should return a valid lint-staged configuration object without jest', () => {
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

      const config = makeLintStagedrc({
        eslint: true,
        jest: false,
        prettier: true,
        typescript: true,
      });

      expect(config).toEqual(expectedConfig);
    });
  });
  describe('When prettier is false and all other options are true', () => {
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

      const config = makeLintStagedrc({
        eslint: true,
        jest: true,
        prettier: false,
        typescript: true,
      });

      expect(config).toEqual(expectedConfig);
    });
  });

  describe('When eslint is false and all other options are true', () => {
    it('should return a valid lint-staged configuration object without ESLint', () => {
      const options = {
        eslint: false,
        jest: true,
        prettier: true,
        typescript: true,
      };
      const expectedConfig = {
        '**/*.js?(x)': [
          'prettier --check .',
          'prettier --write .',
          'jest --ci',
        ],
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
        '**/*.{css}': ['prettier --check .', 'prettier --write .'],
      };

      const config = makeLintStagedrc(options);

      expect(config).toEqual(expectedConfig);
    });
  });
});
