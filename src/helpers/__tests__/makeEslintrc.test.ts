import makeEslintrc from '../makeEslintrc.js';

describe('makeEslintrc', () => {
  describe('When all passed options are false', () => {
    it('should return a valid default ESLint configuration', () => {
      const config = makeEslintrc({
        eslint: true,
        reactTestingLibrary: false,
        prettier: false,
        storybook: false,
        typescript: false,
      });
      expect(config).toEqual({
        root: true,
        extends: ['next/core-web-vitals'],
      });
    });
  });

  describe('When all passed options are true', () => {
    it('should return a valid ESLint configuration reflecting those options', () => {
      const config = makeEslintrc({
        eslint: true,
        reactTestingLibrary: true,
        prettier: true,
        storybook: true,
        typescript: true,
      });
      expect(config).toEqual({
        root: true,
        plugins: ['@typescript-eslint', 'testing-library'],
        extends: [
          'next/core-web-vitals',
          'plugin:@typescript-eslint/recommended',
          'plugin:storybook/recommended',
          'prettier',
        ],
        rules: {
          '@typescript-eslint/no-unused-vars': 'error',
          '@typescript-eslint/no-explicit-any': 'error',
        },
        overrides: [
          {
            files: [
              '**/__tests__/**/*.[jt]s?(x)',
              '**/?(*.)+(spec|test).[jt]s?(x)',
            ],
            extends: ['plugin:testing-library/react'],
          },
        ],
      });
    });
  });

  describe('When prettier is set to be true', () => {
    it('should return a valid ESLint configuration with prettier support', () => {
      const config = makeEslintrc({
        eslint: true,
        reactTestingLibrary: false,
        prettier: true,
        storybook: false,
        typescript: false,
      });
      expect(config).toEqual({
        root: true,
        extends: ['next/core-web-vitals', 'prettier'],
      });
    });
  });

  describe('When storybook is set to be true', () => {
    it('should return a valid ESLint configuration with storybook support', () => {
      const config = makeEslintrc({
        eslint: true,
        reactTestingLibrary: false,
        prettier: false,
        storybook: true,
        typescript: false,
      });
      expect(config).toEqual({
        root: true,
        extends: ['next/core-web-vitals', 'plugin:storybook/recommended'],
      });
    });
  });

  describe('When storybook, reactTestingLibrary and typescript is set to be true', () => {
    it('should return a valid ESLint configuration with support for those options', () => {
      const config = makeEslintrc({
        eslint: true,
        reactTestingLibrary: true,
        prettier: false,
        storybook: false,
        typescript: true,
      });
      expect(config).toEqual({
        root: true,
        plugins: ['@typescript-eslint', 'testing-library'],
        extends: [
          'next/core-web-vitals',
          'plugin:@typescript-eslint/recommended',
        ],
        rules: {
          '@typescript-eslint/no-unused-vars': 'error',
          '@typescript-eslint/no-explicit-any': 'error',
        },
        overrides: [
          {
            files: [
              '**/__tests__/**/*.[jt]s?(x)',
              '**/?(*.)+(spec|test).[jt]s?(x)',
            ],
            extends: ['plugin:testing-library/react'],
          },
        ],
      });
    });
  });
});
