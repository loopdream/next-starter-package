import { OptionsType } from '../Configurator.js';

type MakeLintStagedrc = Pick<
  OptionsType,
  'eslint' | 'jest' | 'prettier' | 'typescript'
>;

function makeLintStagedrc({
  eslint,
  jest,
  prettier,
  typescript,
}: MakeLintStagedrc) {
  const tsLintStagedConfig = {
    '**/*.ts?(x)': [
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

  const lintStagedrc = {
    '**/*.js?(x)': [
      ...(prettier ? ['prettier --check .', 'prettier --write .'] : []),
      ...(eslint ? ['eslint .', 'eslint --fix .'] : []),
      ...(jest ? ['jest --ci'] : []),
    ],
    ...(typescript ? tsLintStagedConfig : {}),
    ...(prettier ? mdYmlJsonLintStagedConfig : {}),
    ...(prettier ? stylesLintStagedConfig : {}),
  };

  return lintStagedrc;
}

export default makeLintStagedrc;
