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
  const tsLintConfig = {
    '**/*.ts?(x)': [
      ...(prettier ? ['prettier --write .'] : []),
      ...(eslint ? ['eslint --fix .'] : []),
      ...(jest ? ['jest --ci'] : []),
      'tsc --noEmit',
    ],
  };

  const mdYmlJsonConfig = {
    '**/*.{md, yml, yaml, json}': [...(prettier ? ['prettier --write .'] : [])],
  };

  const stylesConfig = {
    '**/*.{css}': [
      ...(prettier ? ['prettier --write .'] : []),
      // TODO: add styledlint
    ],
  };

  const lintStagedrc = {
    '**/*.js?(x)': [
      ...(prettier ? ['prettier --write .'] : []),
      ...(eslint ? ['eslint --fix .'] : []),
      ...(jest ? ['jest --ci'] : []),
    ],
    ...(typescript ? tsLintConfig : {}),
    ...(prettier ? mdYmlJsonConfig : {}),
    ...(prettier ? stylesConfig : {}),
  };

  return lintStagedrc;
}

export default makeLintStagedrc;
