/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  modulePaths: ['<rootDir>/src/'],
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/.husky/',
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
