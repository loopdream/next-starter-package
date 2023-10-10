import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts'],
  modulePaths: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.(js|jsx|ts|tsx)$': '$1',
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/tmp/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

export default jestConfig;
