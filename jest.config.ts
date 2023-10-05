/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  modulePaths: ['<rootDir>/src/'],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/.husky/',
  ],
  transform: {
    '^.+\\.[jt]s?(x)': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
