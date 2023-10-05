import { OptionsType } from '../Configurator.js';

type LintStagedConfigType = Pick<
  OptionsType,
  'eslint' | 'jest' | 'prettier' | 'typescript'
>;

function makeLintStagedConfig({
  eslint,
  jest,
  prettier,
  typescript,
}: LintStagedConfigType) {
  const tsLintStagedConfig = {
    '**/*.{ts,tsx}': [
      ...(prettier ? ['prettier --check .', 'prettier --write .'] : []),
      ...(eslint ? ['eslint .', 'eslint --fix .'] : []),
      ...(jest ? ['jest --ci'] : []),
      'tsc --noEmit',
    ],
  };

  const lintStagedConfig = {
    '**/*.{js,jsx}': [
      ...(prettier ? ['prettier --check .', 'prettier --write .'] : []),
      ...(eslint ? ['eslint .', ' eslint --fix .'] : []),
      ...(jest ? [' jest --ci'] : []),
    ],
    ...(typescript ? tsLintStagedConfig : {}),
    '**/*.{md, yml, yaml, json}': ['prettier --check .', 'prettier --write .'],
    '**/*.{css}': ['prettier --check .', 'prettier --write .'], // TODO: add styledlint
  };

  return lintStagedConfig;
}

export default makeLintStagedConfig;
