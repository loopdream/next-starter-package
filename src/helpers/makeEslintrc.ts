import { OptionsType } from '../Configurator.js';

type MakeEslintrcType = Pick<
  OptionsType,
  'eslint' | 'reactTestingLibrary' | 'prettier' | 'storybook' | 'typescript'
>;

function makeEslintrc({
  eslint,
  reactTestingLibrary,
  prettier,
  storybook,
  typescript,
}: MakeEslintrcType) {
  if (!eslint) return;

  const overrides = [
    ...(reactTestingLibrary
      ? [
          {
            files: [
              '**/__tests__/**/*.[jt]s?(x)',
              '**/?(*.)+(spec|test).[jt]s?(x)',
            ],
            extends: ['plugin:testing-library/react'],
          },
        ]
      : []),
  ];

  const plugins = [
    ...(eslint && typescript ? ['@typescript-eslint'] : []),
    ...(reactTestingLibrary ? ['testing-library'] : []),
  ];

  const rules =
    eslint && typescript
      ? {
          '@typescript-eslint/no-unused-vars': 'error',
          '@typescript-eslint/no-explicit-any': 'error',
        }
      : {};

  // TODO: create a make func for the new eslint config file type
  const eslintrc = {
    root: true,
    ...(plugins.length > 0 ? { plugins } : {}),
    extends: [
      'next/core-web-vitals',
      ...(eslint && typescript
        ? ['plugin:@typescript-eslint/recommended']
        : []),
      ...(storybook ? ['plugin:storybook/recommended'] : []),
      ...(prettier ? ['prettier'] : []),
    ],
    ...(Object.keys(rules).length > 0 ? { rules } : {}),
    ...(overrides.length > 0 ? { overrides } : {}),
  };

  return eslintrc;
}

export default makeEslintrc;
