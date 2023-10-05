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

  const mdYmlJsonLintStagedConfig = {
    '**/*.{md, yml, yaml, json}': [
      ...(prettier ? ['prettier --check .', 'prettier --write .'] : []),
    ],
  };

  const stylesLintStagedConfig = {
    '**/*.{css}': [
      ...(prettier ? ['prettier --check .', 'prettier --write .'] : []),
      // TODO: add styledlint
    ],
  };

  const lintStagedConfig = {
    '**/*.{js,jsx}': [
      ...(prettier ? ['prettier --check .', 'prettier --write .'] : []),
      ...(eslint ? ['eslint .', 'eslint --fix .'] : []),
      ...(jest ? ['jest --ci'] : []),
    ],
    ...(typescript ? tsLintStagedConfig : {}),
    ...(prettier ? mdYmlJsonLintStagedConfig : {}),
    ...(prettier ? stylesLintStagedConfig : {}),
  };

  return lintStagedConfig;
}

export default makeLintStagedConfig;
