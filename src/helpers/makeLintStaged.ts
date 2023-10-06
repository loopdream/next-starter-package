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

  const lintStagedConfig = {
    '**/*.js?(x)': [
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

type LintStagedPreCommitType = Pick<
  OptionsType,
  | 'eslint'
  | 'jest'
  | 'prettier'
  | 'typescript'
  | 'lintStaged'
  | 'packageManager'
>;

function makeLintStagedPreCommit({
  eslint,
  jest,
  lintStaged,
  packageManager,
  prettier,
  typescript,
}: LintStagedPreCommitType) {
  let huskyPreCommit =
    '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n';
  if (lintStaged) {
    huskyPreCommit +=
      'npx lint-staged || { \n' +
      'printf "\n\n------------------------------------------\n\n"\n' +
      'printf "🚫 YOU HAVE ERRORS!" \n' +
      'printf "\n\n------------------------------------------\n\n";\n' +
      'exit 1;\n}\n\n';
  } else {
    if (prettier) {
      huskyPreCommit +=
        `${packageManager} run format:check\n\n` +
        `${packageManager} run format:write\n\n`;
    }
    if (eslint) {
      huskyPreCommit +=
        `${packageManager} run lint:check\n\n` +
        `${packageManager} run lint:fix\n\n`;
    }
    if (jest) {
      huskyPreCommit += `${packageManager} run test --passWithNoTests\n\n`;
    }
    if (typescript) {
      huskyPreCommit += `${packageManager} run build --no-emit\n\n`;
    }
  }
  huskyPreCommit +=
    '# Following is for observability purposes\n\n' +
    '# TODOs / FIXMEs\n' +
    'printf "\n\n"\n' +
    'printf "TODOs / FIXMEs - consider reviewing these"\n' +
    'printf "\n------------------------------------------\n"\n#\n' +
    "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
    'printf "\n\n------------------------------------------\n\n"\n' +
    'printf "Now push your code! 🚀"\n' +
    'printf "\n\n------------------------------------------\n\n"';
  return huskyPreCommit;
}

export default {
  config: makeLintStagedConfig,
  preCommit: makeLintStagedPreCommit,
};
