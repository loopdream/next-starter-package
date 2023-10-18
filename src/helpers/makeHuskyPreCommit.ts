import { OptionsType } from '../Configurator.js';

type LintStagedPreCommitType = Pick<
  OptionsType,
  | 'eslint'
  | 'jest'
  | 'prettier'
  | 'typescript'
  | 'lintStaged'
  | 'packageManager'
>;

export const huskyFragments = {
  head: ['#!/usr/bin/env sh', '. "$(dirname -- "$0")/_/husky.sh"'].join('\n'),
  lintStaged: [
    'printf "\n\n"',
    'npx lint-staged || {',
    ' printf "\n\n------------------------------------------\n\n"',
    ' printf "🚫 YOU HAVE ERRORS!"',
    ' printf "\n\n------------------------------------------\n\n"',
    ' exit 1;',
    '}',
  ].join('\n'),
  prettier: [
    `<PACKAGE_MANAGER> run format:check`,
    `<PACKAGE_MANAGER> run format:write`,
  ].join('\n'),
  eslint: [
    `<PACKAGE_MANAGER> run lint:check`,
    `<PACKAGE_MANAGER> run lint:fix`,
  ].join('\n'),
  jest: ['', `<PACKAGE_MANAGER> run test --passWithNoTests`].join('\n'),
  typescript: [`<PACKAGE_MANAGER> run build --no-emit`].join('\n'),
  leasot: [
    '# Following is for observability purposes',
    '',
    'printf "\n\n"',
    'printf "TODOs / FIXMEs - consider reviewing these"',
    'printf "\n------------------------------------------\n"',
    '',
    "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely",
  ].join('\n'),
  footer: [
    'printf "\n\n------------------------------------------\n\n"',
    'printf "Now push your code! 🚀"',
    'printf "\n\n------------------------------------------\n\n"',
  ].join('\n'),
};

function makeHuskyPreCommit({
  eslint,
  jest,
  lintStaged,
  packageManager,
  prettier,
  typescript,
}: LintStagedPreCommitType) {
  const huskyPreCommit = [
    huskyFragments.head,
    ...(lintStaged ? [huskyFragments.lintStaged] : []),
    ...(prettier && !lintStaged ? [huskyFragments.prettier] : []),
    ...(eslint && !lintStaged ? [huskyFragments.eslint] : []),
    ...(jest && !lintStaged ? [huskyFragments.jest] : []),
    ...(typescript && !lintStaged ? [huskyFragments.typescript] : []),
    huskyFragments.leasot,
    huskyFragments.footer,
  ]
    .join('\n')
    .replace(/<PACKAGE_MANAGER>/g, packageManager);

  return huskyPreCommit;
}

export default makeHuskyPreCommit;
